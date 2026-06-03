"""
ocr_service.py — Vietnamese product-label OCR + LLM normalization service.

Pipeline:
  1. Pre-process image  (OpenCV: denoise → deskew → threshold)
  2. Tesseract OCR      (vie+eng, OEM 1 / PSM 3)
  3. Rule-based cleanup (Vietnamese OCR artifact patterns)
  4. Two-pass Ollama    (pass-1: correct text | pass-2: extract JSON)
  5. Post-process JSON  (field validation, type coercion, junk removal)

Extra deps vs base requirements.txt:
  opencv-python-headless>=4.9.0
  numpy>=1.26.0
  rapidfuzz>=3.9.0
"""
from __future__ import annotations

import io
import json
import logging
import os
import re
import sys
import time
import uuid
from typing import Any

import cv2
import httpx
import numpy as np
import pytesseract
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from PIL import Image
from rapidfuzz import process as fuzz_process

# ---------------------------------------------------------------------------
# Logging — structured JSON
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


log = _make_logger("ocr_service")

for _wz_name in ("werkzeug",):
    _wz = logging.getLogger(_wz_name)
    _wz.handlers.clear()
    _wz_h = logging.StreamHandler(sys.stdout)
    _wz_h.setFormatter(JsonFormatter())
    _wz.addHandler(_wz_h)
    _wz.propagate = False

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.environ.get("OLLAMA_MODEL",    "llama3.2")
OLLAMA_TIMEOUT  = int(os.environ.get("OLLAMA_TIMEOUT", "120"))

# ---------------------------------------------------------------------------
# Step 1 — Image pre-processing
# ---------------------------------------------------------------------------

def _pil_to_cv(img: Image.Image) -> np.ndarray:
    arr = np.array(img.convert("RGB"))
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


def _deskew(gray: np.ndarray) -> np.ndarray:
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)
    edges   = cv2.Canny(blurred, 50, 150, apertureSize=3)
    lines   = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                              minLineLength=100, maxLineGap=10)
    if lines is None:
        return gray
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 != x1:
            angles.append(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
    if not angles:
        return gray
    median_angle = float(np.median(angles))
    if abs(median_angle) < 0.5 or abs(median_angle) > 15:
        return gray
    h, w = gray.shape
    M = cv2.getRotationMatrix2D((w // 2, h // 2), median_angle, 1.0)
    return cv2.warpAffine(gray, M, (w, h),
                          flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_REPLICATE)


def preprocess_image(img: Image.Image) -> Image.Image:
    """
    Denoise → upscale → deskew → adaptive-threshold → sharpen.
    Returns PIL Image optimised for Tesseract Vietnamese OCR.
    """
    bgr  = _pil_to_cv(img)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    h, w = gray.shape
    if max(h, w) < 1500:
        scale = 1500 / max(h, w)
        gray  = cv2.resize(gray, None, fx=scale, fy=scale,
                           interpolation=cv2.INTER_CUBIC)

    gray = cv2.fastNlMeansDenoising(gray, h=15,
                                    templateWindowSize=7, searchWindowSize=21)
    gray = _deskew(gray)

    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31, C=10,
    )

    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
    sharp  = cv2.filter2D(binary, -1, kernel)

    return Image.fromarray(sharp)

# ---------------------------------------------------------------------------
# Step 2 — Tesseract OCR
# ---------------------------------------------------------------------------

TESS_CONFIG = r"--oem 1 --psm 3"


def run_tesseract(img: Image.Image, lang: str = "vie+eng") -> str:
    return pytesseract.image_to_string(img, lang=lang, config=TESS_CONFIG).strip()

# ---------------------------------------------------------------------------
# Step 3 — Rule-based OCR cleanup
# ---------------------------------------------------------------------------
# All patterns use plain ASCII escapes so the file is encoding-safe.
# Vietnamese characters are written directly (UTF-8 source file).

_RAW_RULES: list[tuple[str, str]] = [
    # ── Lines that are pure punctuation/symbols — drop them ─────────────────
    (r"(?m)^[\s\-\u2013\u2014.`'\"\~\+\|*/\\<>\{\}\(\)\[\]#@\^&%\$!\?°]+$", ""),

    # ── Company / legal suffixes ─────────────────────────────────────────────
    (r"OWNG\s*TY\s*TN[HN][HN]?",                "CÔNG TY TNHH"),
    (r"C[O0]NG\s*TY\s*C[O0]?\s*PH[AÀÂ]N",      "CÔNG TY CỔ PHẦN"),
    (r"C[NM]G\s+TY\s+T[HN][HN][HN]",            "CÔNG TY TNHH"),
    (r"\bTNH\b",                                  "TNHH"),
    (r"\bSx&TH\b",                                "SX&TM"),
    (r"\$[/&]*TM\b",                              "SX&TM"),
    (r"\bSX\s*[&+]\s*TM\b",                      "SX&TM"),
    (r"\bDN\s*TW\b",                              "DOANH NGHIỆP TƯ NHÂN"),
    (r"\bPHU\s+TOAN\b",                           "PHÚ TOÀN"),

    # ── Brand ────────────────────────────────────────────────────────────────
    (r"\bVIETRU[€EC\u20ac]\b",                   "VIETRUE"),

    # ── Province / city names ────────────────────────────────────────────────
    (r"9[AÀÂ]N\s+QUANG\s+NAM",                  "QUẢNG NAM"),
    (r"9[AÀÂ]NG\s+NAM",                          "QUẢNG NAM"),
    (r"\bĐ[AÀÂ]\s+N[AẴ]NG\b",                   "ĐÀ NẴNG"),
    (r"\bTP\.?\s*Đ[AÀÂ]\s*N[AẴ]NG\b",           "TP. Đà Nẵng"),
    (r"\bSng\s+Bình\b",                           "Thăng Bình"),

    # ── Address noise ────────────────────────────────────────────────────────
    (r"\b0/82\b",                                 ""),
    (r"\bGh\s*2ược\b",                            "Dược"),
    (r"2ược",                                     "Dược"),
    (r"«Duce",                                    "Dược"),
    (r"(?<!\w)Duce\b",                           "Dược"),
    (r"Thôn\s+Tất\s*Viết\b",                     ""),
    (r"\bXaTha\s*\.",                             ""),
    (r"Tron\s+T[eế]t\b",                         ""),
    (r"\ba\s+lê\b",                               ""),
    (r"Cụm\s+CN\s+Hà\s+Lam",                     "Cụm CN Hà Lam"),
    (r"Thăng\s+Bình,?\s*TP\.",                    "Thăng Bình, TP."),

    # ── Phone / URL ──────────────────────────────────────────────────────────
    (r"0356[\s.]552[\s.]+\d+",                   "0356.552.593"),
    (r"wwwve\b\S*",                               "www.vietrue.vn"),
    (r"wwwxietru\S*",                             "www.vietrue.vn"),
    (r"www\.vietrue\S*",                          "www.vietrue.vn"),

    # ── Measurement / dosage ─────────────────────────────────────────────────
    (r"2[Oo0]ml",                                 "20ml"),
    (r"3[Oo0]m[l!]",                             "30ml"),
    (r"(\d+)\s*ml\s*[-\u2013]\s*(\d+)\s*ml",    r"\1ml - \2ml"),
    (r"\bm[l!]\b",                               "ml"),
    (r"6c\s+[Hh]o\s+b[eê]n",                    "60 phút"),
    (r"\b6[Oo0]\b(?=\s*(?:phút|giây|s\b))",     "60"),

    # ── OCR character look-alike substitutions ────────────────────────────────
    (r"\b4[eé]\b",                               "để"),
    (r"\b1[àa]\b",                               "là"),
    (r"\baude\b",                                "nước"),
    (r"\bra\s+ty\b",                             ""),
    (r"\bxgậm\b",                                "súc miệng"),
    (r"\bwe\s+miệng\b",                          "súc miệng"),
    (r"\bnhá\s+lu\b",                            "nhổ ra"),
    (r"\bI\*\s*5\s*ng\s+pra\s+bo\b",            ""),
    (r"\bpra\s+bo\b",                            ""),
    (r"\btầm\s+dung",                            "thấm dung"),
    (r"\bach\s+đá\s+lạu",                        "dịch để lau"),
    (r"\bbụi\s+bin\b",                           "bụi bẩn"),
    (r"\bbà\s+nhữn\b",                           "bã nhờn"),
    (r"\bDam\s+trận\b",                          "bám trên"),
    (r"\bđa\s+mat\b",                            "da mặt"),
    (r"\bđậc\s+biệt\b",                          "đặc biệt"),
    (r"\btham\s+gis\b",                          "tham gia"),
    (r"\bhoc\b(?=\s+làm)",                       "hoặc"),
    (r"\bvies\b",                                "việc"),
    (r"\btrưng\b",                               "trường"),
    (r"\bkhôi\s+bụi\b",                          "khói bụi"),
    (r"\blâu\s+rua\b",                           "lau rửa"),
    (r"\blau\s+rỬa\b",                           "lau rửa"),
    (r"\brỬa\b",                                 "rửa"),
    (r"\bthy\s+trang\b",                         "tẩy trang"),
    (r"\bNgo[O0]D\b",                            "ngoài"),
    (r"\bvider\s+nhiềm\b",                       "viêm nhiễm"),
    (r"\bsa\s+«tay\b",                           "xa tầm tay"),
    (r"\bkhô\s+mat\b",                           "khô mát"),
    (r"\btrở\s+em\b",                            "trẻ em"),
    (r"\blôBM\b",                                ""),
    (r"\btog\b",                                 ""),
    (r"\bjay\b",                                 ""),

    # ── Vietnamese word corrections ──────────────────────────────────────────
    (r"\bhoưr\b",                                "hoặc"),
    (r"\bvier\s+hi[eể]m\b",                     "viêm nhiễm"),
    (r"\b4[eé]c\b",                              "để"),
    (r"\bđặcg\b",                                "đặc"),
    (r"b[aá]\s*nhờn",                            "bã nhờn"),
    (r"bụi\s+ban\b",                             "bụi bẩn"),
    (r"trận\s+da\b",                             "trên da"),
    (r"\bmat,",                                  "mát,"),
    (r"HƯỚNG\s+DAN\b",                           "HƯỚNG DẪN"),
    (r"BAO\s+QUAN\b",                            "BẢO QUẢN"),
    (r"masage",                                  "massage"),
    (r"\baps\b",                                 "pha"),
    (r"dung\s+địch",                             "dung dịch"),
    (r"ch:\s*[\"']?ai\s+K\s+nạn",               "cho da lành"),

    # ── Stray non-printable / rare Unicode ───────────────────────────────────
    (r"[\u1a3a-\u1a3f\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", ""),

    # ── Whitespace normalisation ─────────────────────────────────────────────
    (r"[ \t]{2,}", " "),
    (r"\n{3,}",    "\n\n"),
]

_RULES = [(re.compile(p, re.IGNORECASE | re.UNICODE), r)
          for p, r in _RAW_RULES]


def clean_ocr_text(text: str) -> str:
    """Apply all rule-based substitutions to raw OCR output."""
    for pattern, replacement in _RULES:
        text = pattern.sub(replacement, text)
    # Remove lines that became empty after substitutions
    lines = [ln.strip() for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# Step 4 — Two-pass Ollama normalization
# ---------------------------------------------------------------------------

# Pass 1: correct Vietnamese text only — no JSON yet
_CORRECT_PROMPT = """\
Bạn là chuyên gia sửa lỗi OCR tiếng Việt cho nhãn sản phẩm.

Đầu vào là văn bản OCR từ nhãn sản phẩm Việt Nam — có thể là dung dịch vệ sinh, \
nước súc miệng, mỹ phẩm, thực phẩm, dược phẩm, v.v.

NHIỆM VỤ: Chỉ sửa lỗi OCR. Trả về văn bản tiếng Việt đúng chính tả, đầy đủ dấu.
KHÔNG thêm thông tin không có trong văn bản gốc.
KHÔNG thay đổi cấu trúc / thứ tự thông tin.
KHÔNG giải thích — chỉ trả về văn bản đã sửa.

Quy tắc sửa lỗi:
1. Khôi phục dấu thanh/mũ bị mất: "gdi" → "gỏi", "tring" → "trứng", "sưa" → "sữa"
2. Nối từ bị tách sai: "b ã" → "bã", "đ ể" → "để"
3. Sửa ký tự nhầm lẫn: "0"↔"O", "1"↔"l"↔"I", "rn"↔"m", "cl"↔"d"
4. Dùng ngữ cảnh sản phẩm Việt Nam để suy ra từ đúng nhất
5. Bỏ các ký tự noise hoàn toàn vô nghĩa (dòng chỉ toàn ký tự đặc biệt)
6. Giữ nguyên số điện thoại, địa chỉ, URL (chỉ sửa lỗi rõ ràng)

Ví dụ điển hình:
  "aps dung địch ra ty" → "pha dung dịch ra ly"
  "xgậm 20ml - 30ml" → "súc miệng 20ml - 30ml"
  "lâu rua sau khi thy trang" → "lau rửa sau khi tẩy trang"
  "tránh vider nhiềm" → "tránh viêm nhiễm"
  "VIETRU€" → "VIETRUE"
  "OWNG TY TNH Sx&TH" → "CÔNG TY TNHH SX&TM"
  "Dam trận đa mat" → "bám trên da mặt"
  "NgoOD" → "ngoài"
  "sa «tay trở em" → "xa tầm tay trẻ em"
  "tình dục" khi context là vệ sinh → "sinh dục"

Chỉ trả về văn bản đã sửa, không giải thích.\
"""

# Pass 2: extract structured JSON from corrected text
_EXTRACT_PROMPT = """\
Bạn là chuyên gia trích xuất dữ liệu sản phẩm từ nhãn hàng Việt Nam.

Đầu vào là văn bản nhãn sản phẩm đã sửa lỗi OCR (tiếng Việt chuẩn).

NHIỆM VỤ: Trích xuất thông tin vào JSON theo schema sau.
Trả về JSON thuần túy — KHÔNG markdown, KHÔNG giải thích, KHÔNG text thừa.

Schema JSON:
{
  "name": "<tên sản phẩm chính — KHÔNG phải tên công ty>",
  "description": "<mô tả đầy đủ: công dụng, cách dùng, thành phần — ghép từ toàn bộ nội dung liên quan>",
  "barcode": "<chỉ chữ số, 8-14 ký tự — BỎ QUA nếu không có mã vạch thực sự>",
  "originalPrice": <số nguyên VNĐ — BỎ QUA nếu không có>,
  "catalogId": "<mã danh mục nếu có>",
  "prototypeId": "<mã mẫu nếu có>",
  "attributes": {
    "BRAND": "<tên thương hiệu>",
    "VOLUME": "<dung tích, ví dụ: 500ml>",
    "WEIGHT": "<khối lượng nếu có>",
    "UNIT": "<đơn vị: chai / gói / hộp / lọ — KHÔNG phải từ lạ>",
    "USAGE": "<hướng dẫn sử dụng đầy đủ>",
    "STORAGE": "<hướng dẫn bảo quản>",
    "WARNING": "<cảnh báo nếu có>",
    "INGREDIENTS": "<thành phần nếu có>",
    "MANUFACTURER": "<tên công ty sản xuất>",
    "MANUFACTURER_ADDRESS": "<địa chỉ đầy đủ của nhà sản xuất>",
    "ORIGIN": "<xuất xứ, ví dụ: Việt Nam>",
    "PHONE": "<số điện thoại>",
    "WEBSITE": "<website>",
    "EXPIRY": "<hạn sử dụng nếu có>",
    "CERTIFICATION": "<chứng nhận nếu có>"
  }
}

Quy tắc bắt buộc:
1. name: tên sản phẩm nổi bật nhất — thường là dòng chữ lớn nhất, KHÔNG phải tên công ty
2. description: tổng hợp toàn bộ công dụng + cách dùng thành đoạn văn mạch lạc
3. barcode: địa chỉ / tên tỉnh / số lô KHÔNG phải barcode — bỏ qua nếu không chắc
4. Omit (bỏ qua) bất kỳ trường nào không có trong văn bản — KHÔNG dùng null/""/0
5. attributes chỉ chứa thông tin thực sự có trong văn bản
6. Mọi string phải tiếng Việt đúng dấu\
"""


def _call_ollama(messages: list[dict], json_mode: bool = False,
                 request_id: str = "-", pass_name: str = "") -> str | None:
    """Low-level Ollama call. Returns raw content string or None on error."""
    payload: dict[str, Any] = {
        "model":   OLLAMA_MODEL,
        "stream":  False,
        "options": {
            "temperature":    0.05,
            "top_p":          0.9,
            "num_predict":    2048,
            "repeat_penalty": 1.1,
        },
        "messages": messages,
    }
    if json_mode:
        payload["format"] = "json"

    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            resp.raise_for_status()
        content = resp.json()["message"]["content"].strip()
        log.debug("Ollama pass done", extra={
            "request_id": request_id, "pass": pass_name,
            "chars_out": len(content),
        })
        return content
    except httpx.ConnectError:
        log.error("Cannot connect to Ollama", extra={
            "request_id": request_id, "url": OLLAMA_BASE_URL,
        })
    except httpx.HTTPStatusError as exc:
        log.error("Ollama HTTP error", extra={
            "request_id": request_id, "pass": pass_name,
            "status": exc.response.status_code, "body": exc.response.text[:300],
        })
    except Exception:
        log.exception("Ollama call failed", extra={
            "request_id": request_id, "pass": pass_name,
        })
    return None


def normalize_with_ollama(text: str, request_id: str = "-") -> dict:
    """
    Two-pass Ollama pipeline:
      Pass 1 — correct Vietnamese OCR errors → clean text
      Pass 2 — extract structured JSON from clean text
    """
    t0 = time.perf_counter()

    # ── Pass 1: OCR correction ───────────────────────────────────────────────
    corrected = _call_ollama(
        messages=[
            {"role": "system", "content": _CORRECT_PROMPT},
            {"role": "user",   "content": text},
        ],
        json_mode=False,
        request_id=request_id,
        pass_name="correct",
    )

    if not corrected:
        log.warning("Pass 1 failed — using rule-cleaned text for extraction",
                    extra={"request_id": request_id})
        corrected = text   # fallback: use rule-cleaned text directly

    log.info("Pass 1 complete", extra={
        "request_id": request_id,
        "input_chars": len(text),
        "corrected_chars": len(corrected),
    })

    # ── Pass 2: JSON extraction ──────────────────────────────────────────────
    raw_json = _call_ollama(
        messages=[
            {"role": "system", "content": _EXTRACT_PROMPT},
            {"role": "user",   "content": corrected},
        ],
        json_mode=True,
        request_id=request_id,
        pass_name="extract",
    )

    elapsed = round((time.perf_counter() - t0) * 1000, 2)

    if not raw_json:
        log.warning("Pass 2 failed", extra={"request_id": request_id})
        return {}

    # Strip accidental markdown fences
    raw_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_json,
                      flags=re.MULTILINE).strip()

    try:
        result = json.loads(raw_json)
        log.info("Ollama pipeline complete", extra={
            "request_id": request_id, "model": OLLAMA_MODEL,
            "elapsed_ms": elapsed, "top_keys": list(result.keys()),
        })
        return result
    except json.JSONDecodeError as exc:
        log.warning("Pass 2 returned non-JSON", extra={
            "request_id": request_id, "error": str(exc),
            "preview": raw_json[:200],
        })
        return {}

# ---------------------------------------------------------------------------
# Step 5 — Post-processing & validation
# ---------------------------------------------------------------------------

_BARCODE_RE      = re.compile(r"^\d{8,14}$")
_ADDRESS_HINTS   = re.compile(
    r"(Cụm|Hà Lam|Quảng|Đà Nẵng|TP\.|đường|Phường|xã|huyện|tỉnh|CN\s)",
    re.IGNORECASE | re.UNICODE,
    )
_JUNK_VALUE_RE   = re.compile(
    r"^[\s\-\u2013\u2014.`'\"\~\+\|*/\\<>\{\}\(\)\[\]#@\^&%\$!\?]+$",
    re.UNICODE,
)

_VALID_ATTR_KEYS = {
    "BRAND", "UNIT", "WEIGHT", "VOLUME", "ORIGIN",
    "MANUFACTURER", "MANUFACTURER_ADDRESS",
    "INGREDIENTS", "USAGE", "STORAGE", "EXPIRY",
    "DISTRIBUTOR", "WARNING", "CERTIFICATION",
    "WEBSITE", "PHONE", "BATCH", "NSX", "HSD",
}

# Minimum length for a "real" string value (skip single-char garbage)
_MIN_VALUE_LEN = 2


def _is_junk(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    v = value.strip()
    if len(v) < _MIN_VALUE_LEN:
        return True
    if _JUNK_VALUE_RE.match(v):
        return True
    # Starts with a stray diacritic marker like "àn", "ản"
    if re.match(r"^[àảãáạăắặằẳẵâấầẩẫậ]n?\b", v, re.IGNORECASE | re.UNICODE):
        return True
    return False


def _clean_price(value: Any) -> int | None:
    if value is None:
        return None
    s = re.sub(r"[đĐ]|VN[ĐD]|VND|đồng|[,.]", "", str(value),
               flags=re.IGNORECASE).strip()
    return int(s) if s.isdigit() and int(s) > 0 else None


def _validate_barcode(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    v = re.sub(r"\s", "", value)
    if not _BARCODE_RE.match(v):
        return None
    if _ADDRESS_HINTS.search(value):
        return None
    return v


def _clean_attributes(attrs: Any) -> dict:
    if not isinstance(attrs, dict):
        return {}
    out: dict[str, str] = {}
    for raw_key, raw_val in attrs.items():
        key = str(raw_key).upper().strip()

        # Fuzzy-map slightly wrong key names
        if key not in _VALID_ATTR_KEYS:
            m = fuzz_process.extractOne(key, _VALID_ATTR_KEYS, score_cutoff=82)
            if m:
                key = m[0]

        val = str(raw_val).strip() if raw_val is not None else ""
        if _is_junk(val):
            continue

        # UNIT must look like a real unit word
        if key == "UNIT":
            if not re.search(r"[a-zA-ZÀ-ỹ]", val, re.UNICODE):
                continue

        # WEIGHT / VOLUME must contain a digit
        if key in ("WEIGHT", "VOLUME") and not re.search(r"\d", val):
            continue

        if val:
            out[key] = val
    return out


def postprocess(raw: dict) -> dict:
    """Validate and sanitise every field returned by the LLM."""
    out: dict[str, Any] = {}

    for field in ("name", "description", "catalogId", "prototypeId"):
        val = raw.get(field)
        if isinstance(val, str) and not _is_junk(val):
            out[field] = val.strip()

    bc = _validate_barcode(raw.get("barcode"))
    if bc:
        out["barcode"] = bc

    price = _clean_price(raw.get("originalPrice"))
    if price is not None:
        out["originalPrice"] = price

    attrs = _clean_attributes(raw.get("attributes", {}))
    if attrs:
        out["attributes"] = attrs

    return out

# ---------------------------------------------------------------------------
# Main pipeline entry point
# ---------------------------------------------------------------------------


def process_image(
        img: Image.Image,
        upload_file: str = "<stream>",
        request_id: str = "-",
) -> dict:
    """
    Full 5-step pipeline.
    Returns {"raw_text", "cleaned_text", "corrected_text" (if available), "fields"}.
    """
    lang = os.environ.get("TESSERACT_LANG", "vie+eng")

    t0 = time.perf_counter()
    processed_img = preprocess_image(img)
    preprocess_ms = round((time.perf_counter() - t0) * 1000, 2)

    t1 = time.perf_counter()
    raw_text = run_tesseract(processed_img, lang=lang)
    ocr_ms   = round((time.perf_counter() - t1) * 1000, 2)

    log.info("OCR done", extra={
        "request_id":   request_id,
        "upload_file":  upload_file,
        "lang":         lang,
        "preprocess_ms": preprocess_ms,
        "ocr_ms":       ocr_ms,
        "chars":        len(raw_text),
    })

    cleaned_text = clean_ocr_text(raw_text)
    llm_raw      = normalize_with_ollama(cleaned_text, request_id=request_id)
    fields       = postprocess(llm_raw)

    return {
        "raw_text":     raw_text,
        "cleaned_text": cleaned_text,
        "fields":       fields,
    }

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------

app = Flask(__name__)
CORS(app)


@app.before_request
def _before():
    g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    g.start = time.perf_counter()
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


@app.route("/health", methods=["GET"])
def health():
    ollama_ok = False
    try:
        with httpx.Client(timeout=5) as c:
            r = c.get(f"{OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass
    return jsonify({
        "status":  "ok",
        "service": "ocr-service",
        "ollama":  ollama_ok,
        "model":   OLLAMA_MODEL,
    }), 200


@app.route("/api/ocr/extract", methods=["POST"])
def extract():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file        = request.files["image"]
    upload_file = file.filename or "<unnamed>"

    try:
        img = Image.open(io.BytesIO(file.read()))
    except Exception as exc:
        log.warning("Cannot open image", extra={
            "request_id":  g.request_id,
            "upload_file": upload_file,
            "error":       str(exc),
        })
        return jsonify({"error": f"Invalid image: {exc}"}), 400

    try:
        result = process_image(img, upload_file=upload_file,
                               request_id=g.request_id)
        return jsonify(result)
    except Exception as exc:
        log.exception("Pipeline failed", extra={
            "request_id":  g.request_id,
            "upload_file": upload_file,
        })
        return jsonify({"error": str(exc)}), 500


@app.route("/api/ocr/extract-multi", methods=["POST"])
def extract_multi():
    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "No images provided"}), 400

    log.info("Batch start", extra={
        "request_id": g.request_id, "count": len(files),
    })

    results = []
    for file in files:
        upload_file = file.filename or "<unnamed>"
        try:
            img    = Image.open(io.BytesIO(file.read()))
            result = process_image(img, upload_file=upload_file,
                                   request_id=g.request_id)
            results.append({"upload_file": upload_file, **result})
        except Exception as exc:
            log.exception("Pipeline failed for file", extra={
                "request_id":  g.request_id,
                "upload_file": upload_file,
            })
            results.append({"upload_file": upload_file, "error": str(exc)})

    return jsonify({"results": results})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8090))
    log.info("Starting OCR service", extra={
        "port":       port,
        "ollama_url": OLLAMA_BASE_URL,
        "model":      OLLAMA_MODEL,
    })
    app.run(host="0.0.0.0", port=port, debug=False)