import io
import json
import logging
import os
import re
import sys
import time
import uuid

import pytesseract
from flask import Flask, g, jsonify, request
from PIL import Image

# ---------------------------------------------------------------------------
# Logging setup – structured JSON to stdout so `docker compose logs` is clean
# ---------------------------------------------------------------------------

# Reserved LogRecord attributes — NEVER use these as extra={} keys.
# Full reference: https://docs.python.org/3/library/logging.html#logrecord-attributes
_LOG_RECORD_RESERVED = frozenset({
    "args", "created", "exc_info", "exc_text", "filename",
    "funcName", "levelname", "levelno", "lineno", "message",
    "module", "msecs", "msg", "name", "pathname", "process",
    "processName", "relativeCreated", "stack_info", "taskName",
    "thread", "threadName",
})


class JsonFormatter(logging.Formatter):
    """Emit every log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        # Merge any extra keys passed via `extra={...}`, skipping reserved names
        for key, val in record.__dict__.items():
            if key not in _LOG_RECORD_RESERVED:
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

# Redirect Werkzeug (Flask dev server) through the same formatter
_wz = logging.getLogger("werkzeug")
_wz.handlers.clear()
_wz_h = logging.StreamHandler(sys.stdout)
_wz_h.setFormatter(JsonFormatter())
_wz.addHandler(_wz_h)
_wz.propagate = False

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Request lifecycle hooks – assign a request-id, log start/finish
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
# Field extraction
# ---------------------------------------------------------------------------

def extract_fields(text: str) -> dict:
    """Parse common fields from OCR text."""
    fields: dict = {}

    price_match = re.search(
        r"(\d[\d.,]+)\s*(đ|vnd|vnđ)", text, re.IGNORECASE
    )
    if price_match:
        raw = price_match.group(1).replace(",", "").replace(".", "")
        fields["price"] = raw
        log.debug("Price extracted", extra={"price_value": raw})

    sku_match = re.search(
        r"(?:sku|mã\s*sp|mã)[:\s]+([A-Z0-9\-]+)", text, re.IGNORECASE
    )
    if sku_match:
        sku = sku_match.group(1).strip()
        fields["sku"] = sku
        log.debug("SKU extracted", extra={"sku_value": sku})

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if lines:
        fields["name"] = lines[0]
        log.debug("Name extracted", extra={"product_name": lines[0]})

    return fields


def run_ocr(img: Image.Image, upload_filename: str = "<stream>") -> dict:
    """Run Tesseract and return raw_text + fields."""
    lang = os.environ.get("TESSERACT_LANG", "vie+eng")
    t0 = time.perf_counter()
    text = pytesseract.image_to_string(img, lang=lang)
    elapsed = round((time.perf_counter() - t0) * 1000, 2)
    log.info(
        "OCR complete",
        extra={
            "upload_filename": upload_filename,   # 'filename' is reserved — use 'upload_filename'
            "lang": lang,
            "elapsed_ms": elapsed,
            "char_count": len(text.strip()),
            "request_id": getattr(g, "request_id", "-"),
        },
    )
    return {"raw_text": text.strip(), "fields": extract_fields(text)}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ocr-service"})


@app.route("/api/ocr/extract", methods=["POST"])
def extract():
    """Accept a single image and return raw text + parsed fields."""
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
        result = run_ocr(img, upload_filename=upload_filename)
        return jsonify(result)
    except Exception as exc:
        log.exception(
            "OCR failed",
            extra={"upload_filename": upload_filename, "request_id": g.request_id},
        )
        return jsonify({"error": str(exc)}), 500


@app.route("/api/ocr/extract-multi", methods=["POST"])
def extract_multi():
    """Accept multiple images and return a list of results."""
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
            result = run_ocr(img, upload_filename=upload_filename)
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
    log.info("Starting OCR service", extra={"port": port})
    app.run(host="0.0.0.0", port=port, debug=False)