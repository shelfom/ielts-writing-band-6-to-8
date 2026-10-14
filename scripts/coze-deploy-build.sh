#!/usr/bin/env bash
set -euo pipefail

# coze-deploy-build.sh — static project: no build step required.
# Validate that essential files exist before deployment.

echo "[build] Checking static assets..."

for f in index.html; do
  if [ ! -f "$f" ]; then
    echo "[build] ERROR: required file missing: $f" >&2
    exit 1
  fi
done

echo "[build] All static assets present. Nothing to build."
exit 0
