#!/bin/bash
set -e

echo "[Entrypoint] Initializing Lumi AI Studio..."

# Setup .cli-proxy-api auth dir
mkdir -p /root/.cli-proxy-api

if [ -n "$ANTIGRAVITY_AUTH_JSON" ]; then
    echo "$ANTIGRAVITY_AUTH_JSON" > /root/.cli-proxy-api/antigravity-jayuu3654@gmail.com.json
    chmod 600 /root/.cli-proxy-api/antigravity-jayuu3654@gmail.com.json
    echo "[Entrypoint] Successfully injected Antigravity credentials for jayuu3654@gmail.com"
fi

if [ -n "$GOOGLE_FLOW_STORAGE_STATE" ]; then
    echo "$GOOGLE_FLOW_STORAGE_STATE" > /app/server/google_flow_storage_state.json
    chmod 600 /app/server/google_flow_storage_state.json
    echo "[Entrypoint] Successfully injected Google Flow session state"
fi

# Start CLIProxyAPI in background if installed
if [ -f /usr/local/bin/cli-proxy-api ] && [ -f /app/server/cliproxy/config.yaml ]; then
    echo "[Entrypoint] Launching CLIProxyAPI service on port 8317..."
    /usr/local/bin/cli-proxy-api -config /app/server/cliproxy/config.yaml &
    sleep 2
fi

# Start Lumi AI Studio server
echo "[Entrypoint] Launching Lumi server on port ${PORT:-3456}..."
exec python -u server/server.py
