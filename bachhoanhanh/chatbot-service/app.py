"""
chatbot_service.py — AI Chatbot hỗ trợ tư vấn & đặt hàng tự động.

Pipeline:
  1. Nhận message từ frontend (kèm Bearer token + session_id)
  2. Tìm sản phẩm liên quan từ product-service (search API)
  3. Gửi Ollama: lịch sử chat + context sản phẩm → intent detection + reply
  4. Nếu LLM xác nhận đặt hàng → gọi order-service tạo order
  5. Trả về reply + order (nếu có)

Auth flow:
  - Frontend gửi Bearer token trong header Authorization
  - Chatbot forward token đó khi gọi order-service (gateway inject X-User-Id)
  - product-service search không cần auth

Conversation history: in-memory theo session_id (đủ cho demo/đồ án)
"""
from __future__ import annotations

import json
import logging
import os
import re
import sys
import time
import uuid
import py_eureka_client.eureka_client as eureka_client

from collections import defaultdict
from typing import Any

import httpx
from flask import Flask, g, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Logging — structured JSON (giống ocr-service)
# ---------------------------------------------------------------------------

_LOG_RESERVED = frozenset({
    "args", "created", "exc_info", "exc_text", "filename", "funcName",
    "levelname", "levelno", "lineno", "message", "module", "msecs", "msg",
    "name", "pathname", "process", "processName", "relativeCreated",
    "stack_info", "taskName", "thread", "threadName",
})


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts":     self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level":  record.levelname,
            "logger": record.name,
            "msg":    record.getMessage(),
        }
        for k, v in record.__dict__.items():
            if k not in _LOG_RESERVED and not k.startswith("_"):
                payload[k] = v
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def _make_logger(name: str) -> logging.Logger:
    level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logger = logging.getLogger(name)
    logger.setLevel(level)
    if not logger.handlers:
        h = logging.StreamHandler(sys.stdout)
        h.setFormatter(JsonFormatter())
        logger.addHandler(h)
    logger.propagate = False
    return logger


log = _make_logger("chatbot_service")

for _wz_name in ("werkzeug",):
    _wz = logging.getLogger(_wz_name)
    _wz.handlers.clear()
    _wz_h = logging.StreamHandler(sys.stdout)
    _wz_h.setFormatter(JsonFormatter())
    _wz.addHandler(_wz_h)
    _wz.propagate = False

# ---------------------------------------------------------------------------
# Config — đọc từ env (xem docker-compose / .env)
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL   = os.environ.get("OLLAMA_BASE_URL",   "http://localhost:11434")
OLLAMA_MODEL      = os.environ.get("OLLAMA_MODEL",      "llama3.1:8b")
OLLAMA_TIMEOUT    = int(os.environ.get("OLLAMA_TIMEOUT", "120"))

# Gọi qua internal docker network, không qua nginx/gateway
PRODUCT_SERVICE_URL = os.environ.get("PRODUCT_SERVICE_URL", "http://product-service:8080")
ORDER_SERVICE_URL   = os.environ.get("ORDER_SERVICE_URL",   "http://order-service:8081")

# Số lượng sản phẩm tối đa đưa vào context cho LLM
MAX_PRODUCTS_IN_CONTEXT = int(os.environ.get("MAX_PRODUCTS_IN_CONTEXT", "5"))

# Giữ tối đa N lượt (user+bot) trong history để tránh context quá dài
MAX_HISTORY_TURNS = int(os.environ.get("MAX_HISTORY_TURNS", "10"))

# ---------------------------------------------------------------------------
# In-memory conversation store  { session_id: [ {role, content}, ... ] }
# ---------------------------------------------------------------------------

_sessions: dict[str, list[dict]] = defaultdict(list)


def _get_history(session_id: str) -> list[dict]:
    return _sessions[session_id]


def _append_history(session_id: str, role: str, content: str) -> None:
    _sessions[session_id].append({"role": role, "content": content})
    # Trim: giữ MAX_HISTORY_TURNS lượt gần nhất (mỗi lượt = 2 message)
    max_msgs = MAX_HISTORY_TURNS * 2
    if len(_sessions[session_id]) > max_msgs:
        _sessions[session_id] = _sessions[session_id][-max_msgs:]


def _clear_history(session_id: str) -> None:
    _sessions.pop(session_id, None)

# ---------------------------------------------------------------------------
# System prompt — định hình nhân cách + cách trả JSON
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
Bạn là trợ lý bán hàng AI của cửa hàng Bách Hóa Anh. Bạn nói tiếng Việt, thân thiện, ngắn gọn.

NHIỆM VỤ:
1. Tư vấn sản phẩm dựa trên danh sách sản phẩm được cung cấp trong context.
2. Khi khách muốn đặt hàng, xác nhận lại sản phẩm + số lượng, sau đó tạo order.

QUY TẮC TRẢ LỜI — BẮT BUỘC:
Luôn trả về JSON với cấu trúc sau, KHÔNG thêm bất kỳ text nào bên ngoài JSON:

{
  "reply": "<tin nhắn trả lời khách hàng bằng tiếng Việt>",
  "action": "<một trong: NONE | SEARCH | CREATE_ORDER | CONFIRM_ORDER>",
  "search_keyword": "<từ khoá tìm sản phẩm, chỉ có khi action=SEARCH>",
  "order": {
    "items": [
      { "productId": "<id sản phẩm dạng string>", "quantity": <số nguyên> }
    ],
    "voucherCode": "<mã voucher nếu khách nhắc, để null nếu không có>"
  }
}

Giải thích action:
- NONE: trả lời thông thường, không làm gì thêm
- SEARCH: cần tìm thêm sản phẩm theo từ khoá (search_keyword)
- CONFIRM_ORDER: khách vừa xác nhận muốn đặt, điền đầy đủ order.items
- CREATE_ORDER: KHÔNG dùng trực tiếp, hệ thống sẽ xử lý sau CONFIRM_ORDER

Lưu ý quan trọng:
- Chỉ đặt action=CONFIRM_ORDER khi khách nói rõ "đặt", "mua", "order", "cho tôi mua", "lấy X cái", v.v.
- Nếu chưa chắc productId, đặt action=SEARCH để tìm trước.
- productId phải lấy từ danh sách sản phẩm được cung cấp, KHÔNG tự bịa.
- Nếu khách hỏi giá / tồn kho, trả lời từ thông tin có sẵn trong context.
- KHÔNG bao giờ trả về text thuần — luôn luôn là JSON hợp lệ.
"""

# ---------------------------------------------------------------------------
# Gọi product-service
# ---------------------------------------------------------------------------


def search_products(keyword: str, request_id: str = "-") -> list[dict]:
    """Tìm sản phẩm theo tên, trả về list ProductResponse."""
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(
                f"{PRODUCT_SERVICE_URL}/products/search",
                params={"name": keyword},
            )
            resp.raise_for_status()
            products = resp.json()
            log.info("Product search ok", extra={
                "request_id": request_id,
                "keyword": keyword,
                "count": len(products),
            })
            return products[:MAX_PRODUCTS_IN_CONTEXT]
    except httpx.ConnectError:
        log.error("Cannot connect to product-service", extra={
            "request_id": request_id, "url": PRODUCT_SERVICE_URL,
        })
    except Exception:
        log.exception("Product search failed", extra={
            "request_id": request_id, "keyword": keyword,
        })
    return []


def get_all_products(request_id: str = "-") -> list[dict]:
    """Lấy tất cả sản phẩm (dùng khi khách hỏi chung chung)."""
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(f"{PRODUCT_SERVICE_URL}/products")
            resp.raise_for_status()
            products = resp.json()
            log.info("Get all products ok", extra={
                "request_id": request_id, "count": len(products),
            })
            return products[:MAX_PRODUCTS_IN_CONTEXT]
    except Exception:
        log.exception("Get all products failed", extra={"request_id": request_id})
    return []


def _format_products_for_context(products: list[dict]) -> str:
    """Chuyển list sản phẩm thành text ngắn gọn cho LLM context."""
    if not products:
        return "Không tìm thấy sản phẩm nào phù hợp."
    lines = ["DANH SÁCH SẢN PHẨM HIỆN CÓ:"]
    for p in products:
        stock = p.get("totalAvailableAmount", 0)
        price = p.get("originalPrice", 0)
        line = (
            f"- ID: {p.get('productId')} | {p.get('name')} "
            f"| Giá: {price:,.0f}đ | Tồn: {stock} | "
            f"Mô tả: {(p.get('description') or '')[:80]}"
        )
        lines.append(line)
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# Gọi order-service
# ---------------------------------------------------------------------------


def create_order(
        items: list[dict],
        voucher_code: str | None,
        bearer_token: str,
        keycloak_id: str | None,
        request_id: str = "-",
) -> dict | None:
    """
    Tạo order qua order-service.
    Gửi Bearer token để gateway inject X-User-Id,
    hoặc gửi thẳng keycloakId trong body nếu gọi internal.
    """
    body: dict[str, Any] = {"items": items}
    if voucher_code:
        body["voucherCode"] = voucher_code
    # Gọi internal (không qua gateway) nên phải tự set keycloakId
    if keycloak_id:
        body["keycloakId"] = keycloak_id

    headers = {"Content-Type": "application/json"}
    if bearer_token:
        headers["Authorization"] = bearer_token  # forward token gốc

    try:
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                f"{ORDER_SERVICE_URL}/orders",
                json=body,
                headers=headers,
            )
            resp.raise_for_status()
            order = resp.json()
            log.info("Order created", extra={
                "request_id": request_id,
                "order_id": order.get("id"),
                "items": len(items),
            })
            return order
    except httpx.HTTPStatusError as exc:
        log.error("Order creation failed", extra={
            "request_id": request_id,
            "status": exc.response.status_code,
            "body": exc.response.text[:300],
        })
    except Exception:
        log.exception("Order creation exception", extra={"request_id": request_id})
    return None

# ---------------------------------------------------------------------------
# Gọi Ollama
# ---------------------------------------------------------------------------


def _call_ollama(
        messages: list[dict],
        request_id: str = "-",
) -> str | None:
    """Gọi Ollama chat API, trả về raw content string hoặc None."""
    payload = {
        "model":   OLLAMA_MODEL,
        "stream":  False,
        "format":  "json",   # bắt Ollama trả JSON
        "options": {
            "temperature":    0.3,
            "top_p":          0.9,
            "num_predict":    1024,
            "repeat_penalty": 1.1,
        },
        "messages": messages,
    }
    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            resp.raise_for_status()
        content = resp.json()["message"]["content"].strip()
        log.debug("Ollama response", extra={
            "request_id": request_id, "chars": len(content),
        })
        return content
    except httpx.ConnectError:
        log.error("Cannot connect to Ollama", extra={
            "request_id": request_id, "url": OLLAMA_BASE_URL,
        })
    except Exception:
        log.exception("Ollama call failed", extra={"request_id": request_id})
    return None


def _parse_llm_response(raw: str | None) -> dict:
    """Parse JSON từ LLM, trả về dict an toàn."""
    if not raw:
        return {"reply": "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại.", "action": "NONE"}
    # Strip markdown fences nếu có
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        log.warning("LLM returned non-JSON", extra={"preview": raw[:200]})
        return {"reply": raw, "action": "NONE"}

# ---------------------------------------------------------------------------
# Core chat logic
# ---------------------------------------------------------------------------


def process_message(
        user_message: str,
        session_id: str,
        bearer_token: str,
        keycloak_id: str | None,
        request_id: str = "-",
) -> dict:
    """
    Xử lý một lượt chat:
    1. Tìm sản phẩm liên quan (search hoặc lấy tất cả)
    2. Build messages gửi Ollama (system + history + context + user message)
    3. Parse response → nếu CONFIRM_ORDER thì gọi order-service
    4. Lưu history, trả kết quả
    """
    t0 = time.perf_counter()

    # ── Bước 1: Tìm sản phẩm để đưa vào context ──────────────────────────
    # Tìm keyword đơn giản từ message (LLM sẽ refine lại nếu cần)
    products = search_products(user_message, request_id=request_id)
    if not products:
        # Fallback: lấy vài sản phẩm mặc định để LLM có context
        products = get_all_products(request_id=request_id)

    product_context = _format_products_for_context(products)

    # ── Bước 2: Build Ollama messages ─────────────────────────────────────
    history = _get_history(session_id)

    # System message chứa cả product context (inject mỗi lượt để luôn fresh)
    system_content = _SYSTEM_PROMPT + "\n\n" + product_context

    ollama_messages = [{"role": "system", "content": system_content}]
    ollama_messages.extend(history)
    ollama_messages.append({"role": "user", "content": user_message})

    # ── Bước 3: Gọi Ollama ────────────────────────────────────────────────
    raw_response = _call_ollama(ollama_messages, request_id=request_id)
    llm_result   = _parse_llm_response(raw_response)

    action       = llm_result.get("action", "NONE")
    reply        = llm_result.get("reply", "Tôi không hiểu, bạn có thể nói rõ hơn không?")

    # ── Bước 3b: Nếu LLM muốn tìm thêm sản phẩm theo keyword cụ thể ──────
    if action == "SEARCH":
        keyword = llm_result.get("search_keyword", user_message)
        extra_products = search_products(keyword, request_id=request_id)
        if extra_products:
            # Gọi lại Ollama với context mới
            extra_context = _format_products_for_context(extra_products)
            system_content2 = _SYSTEM_PROMPT + "\n\n" + extra_context
            ollama_messages2 = [{"role": "system", "content": system_content2}]
            ollama_messages2.extend(history)
            ollama_messages2.append({"role": "user", "content": user_message})
            raw_response2 = _call_ollama(ollama_messages2, request_id=request_id)
            llm_result   = _parse_llm_response(raw_response2)
            action       = llm_result.get("action", "NONE")
            reply        = llm_result.get("reply", reply)

    # ── Bước 4: Tạo order nếu LLM confirm ────────────────────────────────
    order_result = None
    if action == "CONFIRM_ORDER":
        order_data   = llm_result.get("order", {})
        items        = order_data.get("items", [])
        voucher_code = order_data.get("voucherCode")

        if items:
            order_result = create_order(
                items=items,
                voucher_code=voucher_code,
                bearer_token=bearer_token,
                keycloak_id=keycloak_id,
                request_id=request_id,
            )
            if order_result:
                order_id = order_result.get("id")
                reply += f"\n\n✅ Đơn hàng #{order_id} đã được tạo thành công!"
            else:
                reply += "\n\n❌ Rất tiếc, không thể tạo đơn hàng lúc này. Vui lòng thử lại."
        else:
            reply += "\n\n⚠️ Không xác định được sản phẩm cần đặt. Bạn có thể nói rõ hơn không?"

    # ── Bước 5: Lưu history ───────────────────────────────────────────────
    _append_history(session_id, "user",      user_message)
    _append_history(session_id, "assistant", reply)

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
    log.info("Chat turn done", extra={
        "request_id": request_id,
        "session_id": session_id,
        "action":     action,
        "elapsed_ms": elapsed_ms,
        "order_id":   order_result.get("id") if order_result else None,
    })

    return {
        "reply":      reply,
        "action":     action,
        "order":      order_result,
        "session_id": session_id,
    }

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)


@app.before_request
def _before():
    g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    g.start      = time.perf_counter()
    log.debug("request in", extra={
        "request_id": g.request_id,
        "method":     request.method,
        "path":       request.path,
        "ip":         request.remote_addr,
    })


@app.after_request
def _after(response):
    ms  = round((time.perf_counter() - g.start) * 1000, 2)
    lvl = logging.WARNING if response.status_code >= 400 else logging.INFO
    log.log(lvl, "request out", extra={
        "request_id": g.request_id,
        "method":     request.method,
        "path":       request.path,
        "status":     response.status_code,
        "elapsed_ms": ms,
    })
    response.headers["X-Request-ID"] = g.request_id
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    """Health check — kiểm tra kết nối Ollama."""
    ollama_ok = False
    try:
        with httpx.Client(timeout=5) as c:
            r = c.get(f"{OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass
    return jsonify({
        "status":       "ok",
        "service":      "chatbot-service",
        "ollama":       ollama_ok,
        "model":        OLLAMA_MODEL,
        "sessions":     len(_sessions),
    }), 200


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    POST /api/chat
    Body JSON:
      {
        "message":    "tôi muốn mua 2 kg thịt bò",
        "session_id": "abc123"   // optional, tự tạo nếu thiếu
      }
    Headers:
      Authorization: Bearer <token>   // optional, cần để tạo order
      X-User-Id: <keycloak_id>        // optional, inject từ gateway
    """
    data = request.get_json(silent=True) or {}

    message = (data.get("message") or "").strip()
    if not message:
        return jsonify({"error": "message is required"}), 400

    session_id   = data.get("session_id") or str(uuid.uuid4())[:12]
    bearer_token = request.headers.get("Authorization", "")
    keycloak_id  = request.headers.get("X-User-Id") or data.get("keycloakId")

    result = process_message(
        user_message=message,
        session_id=session_id,
        bearer_token=bearer_token,
        keycloak_id=keycloak_id,
        request_id=g.request_id,
    )

    return jsonify(result), 200


@app.route("/api/chat/history/<session_id>", methods=["GET"])
def get_history(session_id: str):
    """Lấy lịch sử hội thoại theo session."""
    history = _get_history(session_id)
    return jsonify({
        "session_id": session_id,
        "history":    history,
        "turns":      len(history) // 2,
    }), 200


@app.route("/api/chat/history/<session_id>", methods=["DELETE"])
def clear_history(session_id: str):
    """Xoá lịch sử hội thoại (bắt đầu cuộc trò chuyện mới)."""
    _clear_history(session_id)
    return jsonify({"message": "History cleared", "session_id": session_id}), 200


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    eureka_client.init(
        eureka_server="http://eureka-server:8761/eureka",
        app_name="CHATBOT-SERVICE",
        instance_port=8091
    )

    port = int(os.environ.get("PORT", 8091))
    log.info("Starting chatbot service", extra={
        "port":               port,
        "ollama_url":         OLLAMA_BASE_URL,
        "model":              OLLAMA_MODEL,
        "product_service":    PRODUCT_SERVICE_URL,
        "order_service":      ORDER_SERVICE_URL,
        "max_history_turns":  MAX_HISTORY_TURNS,
    })
    app.run(host="0.0.0.0", port=port, debug=False)