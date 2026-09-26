#!/usr/bin/env bash
# One-time setup for the LLMmap sidecar. Needs Python 3.11 and uv. First model load downloads ~2 GB.
set -euo pipefail
cd "$(dirname "$0")"
[ -d vendor/LLMmap ] || git clone --depth 1 https://github.com/pasquini-dario/LLMmap.git vendor/LLMmap
[ -d .venv ] || uv venv -p 3.11 .venv
uv pip install --python .venv/bin/python -r requirements.txt
echo "Done. Start with: fingerprint/.venv/bin/uvicorn --app-dir fingerprint server:app --port 8765"
