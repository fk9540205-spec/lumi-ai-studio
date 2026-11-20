FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    curl \
    ca-certificates \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    ffmpeg \
    tar \
    && rm -rf /var/lib/apt/lists/*

# Download and install CLIProxyAPI binary
RUN curl -sL https://github.com/router-for-me/CLIProxyAPI/releases/download/v8.0.78/CLIProxyAPI_8.0.78_linux_amd64.tar.gz | tar -xz -C /usr/local/bin/ cli-proxy-api \
    && chmod +x /usr/local/bin/cli-proxy-api

# Set Chrome/Chromium environment variables for nodriver/selenium/g4f/playwright
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Set execution rights on entrypoint
RUN chmod +x /app/entrypoint.sh

# Set environment
ENV PORT=3456
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1
EXPOSE 3456

CMD ["/bin/bash", "/app/entrypoint.sh"]
