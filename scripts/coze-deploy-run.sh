#!/usr/bin/env bash
set -euo pipefail

# coze-deploy-run.sh — start the static file server for deployment.
# Cleans port 5000 if occupied, then launches Python HTTP server in foreground.

echo "[run] Ensuring port 5000 is free..."
if command -v fuser >/dev/null 2>&1; then
  fuser -k 5000/tcp 2>/dev/null || true
  sleep 1
fi

echo "[run] Starting static file server on 0.0.0.0:5000"
exec python3 -m http.server 5000 --bind 0.0.0.0 --directory .
