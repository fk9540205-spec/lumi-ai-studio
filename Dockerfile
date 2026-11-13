FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Chromium for headless token generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    curl \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome/Chromium environment variables for nodriver/selenium/g4f
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Set environment
ENV PORT=3456
ENV HOST=0.0.0.0
EXPOSE 3456

CMD ["python", "server/server.py"]

