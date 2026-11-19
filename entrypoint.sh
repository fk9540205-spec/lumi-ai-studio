#!/bin/bash
set -e

# Setup .cli-proxy-api auth dir
mkdir -p /root/.cli-proxy-api

if [ -n "$ANTIGRAVITY_AUTH_JSON" ]; then
    echo "$ANTIGRAVITY_AUTH_JSON" > /root/.cli-proxy-api/antigravity-jayuu3654@gmail.com.json
    chmod 600 /root/.cli-proxy-api/antigravity-jayuu3654@gmail.com.json
    echo "[Entrypoint] Injected Antigravity auth token for jayuu3654@gmail.com"
fi

# Start CLIProxyAPI in background if installed
if command -v cli-proxy-api &> /dev/null && [ -f /app/server/cliproxy/config.yaml ]; then
    echo "[Entrypoint] Starting CLIProxyAPI background service on :8317..."
    cli-proxy-api -config /app/server/cliproxy/config.yaml &
    sleep 2
elif [ -f /usr/local/bin/cli-proxy-api ] && [ -f /app/server/cliproxy/config.yaml ]; then
    echo "[Entrypoint] Starting CLIProxyAPI background service on :8317..."
    /usr/local/bin/cli-proxy-api -config /app/server/cliproxy/config.yaml &
    sleep 2
fi

# Start Lumi AI Studio server
echo "[Entrypoint] Starting Lumi AI Studio server on port ${PORT:-3456}..."
exec python server/server.py
