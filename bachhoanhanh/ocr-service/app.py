import io
import json
import logging
import os
import re
import sys
import time
import uuid

import httpx
import pytesseract
from flask import Flask, g, jsonify, request
from PIL import Image

# ---------------------------------------------------------------------------
# Logging – structured JSON to stdout
# ---------------------------------------------------------------------------

_LOG_RECORD_RESERVED = frozenset({
    "args", "created", "exc_info", "exc_text", "filename",
    "funcName", "levelname", "levelno", "lineno", "message",
    "module", "msecs", "msg", "name", "pathname", "process",
    "processName", "relativeCreated", "stack_info", "taskName",
    "thread", "threadName",
})


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for key, val in record.__dict__.items():
            if key not in _LOG_RECORD_RESERVED and not key.startswith("_"):
                payload[key] = val
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def build_logger(name: str) -> logging.Logger:
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    logger.propagate = False
    return logger


log = build_logger("ocr_service")

_wz = logging.getLogger("werkzeug")
_wz.handlers.clear()
_wz_h = logging.StreamHandler(sys.stdout)
_wz_h.setFormatter(JsonFormatter())
_wz.addHandler(_wz_h)
_wz.propagate = False

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.environ.get("OLLAMA_MODEL", "llama3.2")
OLLAMA_TIMEOUT  = int(os.environ.get("OLLAMA_TIMEOUT", "120"))

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Request lifecycle
# ---------------------------------------------------------------------------

@app.before_request
def _before():
    g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    g.start = time.perf_counter()
    log.debug(
        "Request started",
        extra={
            "request_id": g.request_id,
            "method": request.method,
            "path": request.path,
            "remote_addr": request.remote_addr,
        },
    )


@app.after_request
def _after(response):
    elapsed_ms = round((time.perf_counter() - g.start) * 1000, 2)
    level = logging.WARNING if response.status_code >= 400 else logging.INFO
    log.log(
        level,
        "Request finished",
        extra={
            "request_id": g.request_id,
            "method": request.method,
            "path": request.path,
            "status": response.status_code,
            "elapsed_ms": elapsed_ms,
        },
    )
    response.headers["X-Request-ID"] = g.request_id
    return response

# ---------------------------------------------------------------------------
# Ollama normalization
# ---------------------------------------------------------------------------

NORMALIZE_SYSTEM_PROMPT = """\
You are a product data extractor and Vietnamese text corrector specialized in product labels.

The input is raw OCR text from a Vietnamese product label. OCR often produces:
- Wrong diacritics (e.g. "gdi" → "gỏi", "trứng it Mh" → "trứng vịt Muối")
- Broken words (e.g. "wp" → "bún", "be hit" → "bê hít")
- Mixed noise characters (e.g. "tring" → "trứng", "hit" → "hít" or "heo")
- Wrong letters due to font/scan quality

Your job:
1. CORRECT all Vietnamese spelling, diacritics, and broken words using context clues
   - Use your knowledge of Vietnamese food, products, ingredients to infer the correct word
   - Example: "Đấm wp và trộn gdi hải sản" → "Bún và trộn gỏi hải sản"
   - Example: "thịt gà nướng, hộ, be hit 06 nướng" → "thịt gà nướng, hổ, bê hít 06 nướng"
   - Prefer the most natural, meaningful Vietnamese reading
2. Extract structured product fields from the corrected text

Return ONLY a valid JSON object — no markdown fences, no explanation, no extra text.

JSON schema (omit fields you cannot find):
{
  "barcode": "<string>",
  "name": "<string — corrected Vietnamese>",
  "description": "<string — corrected Vietnamese>",
  "catalogId": "<string>",
  "originalPrice": <integer, VND only, no separators>,
  "prototypeId": "<string>",
  "attributes": {
    "<UPPERCASE_KEY>": "<corrected Vietnamese value>"
  }
}

Common attribute keys (UPPERCASE): BRAND, UNIT, WEIGHT, VOLUME, ORIGIN,
MANUFACTURER, INGREDIENTS, USAGE, STORAGE, EXPIRY, DISTRIBUTOR, WARNING, CERTIFICATION.

Rules:
- ALL string values must be spell-corrected Vietnamese — never copy garbled OCR as-is
- originalPrice: integer only, strip dong/VND/commas/dots
- name: most prominent product name, not manufacturer
- attributes: any remaining key-value pairs not in top-level fields
- Omit fields that are truly absent — do NOT use null or empty string
- Output pure JSON, nothing else\
"""


def normalize_with_ollama(raw_text: str, request_id: str = "-") -> dict:
    """Call Ollama /api/chat and return a normalized product dict."""
    t0 = time.perf_counter()

    payload = {
        "model": OLLAMA_MODEL,
        "stream": False,
        "format": "json",          # forces JSON output mode in Ollama
        "options": {
            "temperature": 0.0,    # deterministic — we want structured data, not creativity
            "num_predict": 1024,
        },
        "messages": [
            {"role": "system", "content": NORMALIZE_SYSTEM_PROMPT},
            {"role": "user",   "content": raw_text},
        ],
    }

    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            resp = client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            resp.raise_for_status()

        content = resp.json()["message"]["content"].strip()

        # Strip accidental markdown fences just in case
        content = re.sub(r"^```(?:json)?\s*|\s*```$", "", content, flags=re.MULTILINE).strip()

        result = json.loads(content)

        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.info(
            "Ollama normalization complete",
            extra={
                "request_id": request_id,
                "model": OLLAMA_MODEL,
                "elapsed_ms": elapsed_ms,
                "fields_found": list(result.keys()),
                "attribute_count": len(result.get("attributes", {})),
            },
        )
        return result

    except httpx.ConnectError:
        log.error(
            "Cannot connect to Ollama — is the service running?",
            extra={"request_id": request_id, "ollama_url": OLLAMA_BASE_URL},
        )
        return {}

    except httpx.HTTPStatusError as exc:
        log.error(
            "Ollama returned HTTP error",
            extra={
                "request_id": request_id,
                "status": exc.response.status_code,
                "body": exc.response.text[:300],
            },
        )
        return {}

    except json.JSONDecodeError as exc:
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
        log.warning(
            "Ollama returned non-JSON — falling back to empty fields",
            extra={"request_id": request_id, "error": str(exc), "elapsed_ms": elapsed_ms},
        )
        return {}

    except Exception:
        log.exception(
            "Ollama normalization failed",
            extra={"request_id": request_id},
        )
        return {}

# ---------------------------------------------------------------------------
# OCR
# ---------------------------------------------------------------------------

def run_ocr(img: Image.Image, upload_filename: str = "<stream>", request_id: str = "-") -> dict:
    """Run Tesseract, then normalize via Ollama."""
    lang = os.environ.get("TESSERACT_LANG", "vie+eng")

    t0 = time.perf_counter()
    raw_text = pytesseract.image_to_string(img, lang=lang).strip()
    ocr_ms = round((time.perf_counter() - t0) * 1000, 2)

    log.info(
        "OCR complete",
        extra={
            "upload_filename": upload_filename,
            "lang": lang,
            "elapsed_ms": ocr_ms,
            "char_count": len(raw_text),
            "request_id": request_id,
        },
    )

    fields = normalize_with_ollama(raw_text, request_id=request_id)

    return {
        "raw_text": raw_text,
        "fields": fields,
    }

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    """Liveness probe — checks service is up; Ollama status is advisory only."""
    ollama_ok = False
    try:
        with httpx.Client(timeout=5) as client:
            r = client.get(f"{OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass

    # Service is always "ok" — Ollama degraded is surfaced but doesn't fail the probe
    return jsonify({
        "status": "ok",
        "service": "ocr-service",
        "ollama": ollama_ok,
        "model": OLLAMA_MODEL,
    }), 200          # ← always 200


@app.route("/api/ocr/extract", methods=["POST"])
def extract():
    """Accept a single image, return raw OCR text + normalized product fields."""
    if "image" not in request.files:
        log.warning("Missing image field", extra={"request_id": g.request_id})
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]
    upload_filename = file.filename or "<unnamed>"

    log.info(
        "Processing single image",
        extra={"upload_filename": upload_filename, "request_id": g.request_id},
    )

    try:
        img = Image.open(io.BytesIO(file.read()))
        result = run_ocr(img, upload_filename=upload_filename, request_id=g.request_id)
        return jsonify(result)
    except Exception as exc:
        log.exception(
            "OCR failed",
            extra={"upload_filename": upload_filename, "request_id": g.request_id},
        )
        return jsonify({"error": str(exc)}), 500


@app.route("/api/ocr/extract-multi", methods=["POST"])
def extract_multi():
    """Accept multiple images, return a list of results."""
    files = request.files.getlist("images")
    if not files:
        log.warning("Missing images field", extra={"request_id": g.request_id})
        return jsonify({"error": "No images provided"}), 400

    log.info(
        "Processing batch",
        extra={"count": len(files), "request_id": g.request_id},
    )

    results = []
    for file in files:
        upload_filename = file.filename or "<unnamed>"
        try:
            img = Image.open(io.BytesIO(file.read()))
            result = run_ocr(img, upload_filename=upload_filename, request_id=g.request_id)
            results.append({"upload_filename": upload_filename, **result})
        except Exception as exc:
            log.exception(
                "OCR failed for file",
                extra={"upload_filename": upload_filename, "request_id": g.request_id},
            )
            results.append({"upload_filename": upload_filename, "error": str(exc)})

    return jsonify({"results": results})

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8090))
    log.info(
        "Starting OCR service",
        extra={"port": port, "ollama_url": OLLAMA_BASE_URL, "model": OLLAMA_MODEL},
    )
    app.run(host="0.0.0.0", port=port, debug=False)