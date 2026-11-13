#!/usr/bin/env bash
# =============================================================================
# Lumi AI Studio — Free & Reverse-Engineered AI Runner
# =============================================================================

set -e
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================"
echo "  🚀 Starting Lumi AI Studio (Free AI Backend Engine)"
echo "========================================================"

# Check if venv exists, otherwise use system python
if [ -f "$PROJECT_DIR/server/.venv/bin/python3" ]; then
    PYTHON_CMD="$PROJECT_DIR/server/.venv/bin/python3"
    echo "✔ Using Python virtual environment (.venv with g4f)"
else
    PYTHON_CMD="python3"
    echo "✔ Using system Python3"
fi

export PORT="${PORT:-3456}"
export HOST="${HOST:-0.0.0.0}"

echo "✔ Starting Unified Backend on http://localhost:$PORT ..."
exec $PYTHON_CMD "$PROJECT_DIR/server/server.py"

