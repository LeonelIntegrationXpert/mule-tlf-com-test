#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/reports
REPORT="dist/reports/conflict-marker-report.md"
: > "$REPORT"

echo "# Conflict Marker Guard" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

matches=$(grep -RIn --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=release/backups --exclude='*.zip' -E '^[[:space:]]*(<{7}|={7}|>{7})($|[[:space:]])' . || true)

if [[ -n "$matches" ]]; then
  echo "Status: BLOCKED" | tee -a "$REPORT"
  echo "" | tee -a "$REPORT"
  echo '```text' | tee -a "$REPORT"
  echo "$matches" | tee -a "$REPORT"
  echo '```' | tee -a "$REPORT"
  exit 1
fi

echo "Status: PASS" | tee -a "$REPORT"
