FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-vie \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Log verbosity: DEBUG | INFO | WARNING | ERROR (default INFO)
ENV LOG_LEVEL=INFO

# Tesseract language pack(s) to use (default Vietnamese + English)
ENV TESSERACT_LANG=vie+eng

# Port the Flask app listens on
ENV PORT=8090

EXPOSE 8090

CMD ["python", "app.py"]