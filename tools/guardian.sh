#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "============================================================"
echo "Release Flow Guardian Premium - Local Launcher"
echo "============================================================"
echo "Project: $(pwd)"
echo "Node: $(node --version 2>/dev/null || echo not-found)"
echo "npm: $(npm --version 2>/dev/null || echo not-found)"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js 20+ não encontrado."
  exit 1
fi

npm install --package-lock=false --ignore-scripts --no-audit --no-fund
npm run premium:validate
