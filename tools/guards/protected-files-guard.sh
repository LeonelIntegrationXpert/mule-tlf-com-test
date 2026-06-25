#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/reports
REPORT="dist/reports/protected-files-report.md"
: > "$REPORT"

echo "# Protected Files Guard" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

protected_regex='^(api\.raml|types/|traits/|resourceTypes/|examples/|libraries/|securitySchemes/|release/guardian\.config\.yml|release/release-manifest\.yml|release/breaking-changes\.yml|release/api-contract-baseline\.json)'

target_ref=""
if [[ -n "${SYSTEM_PULLREQUEST_TARGETBRANCH:-}" ]]; then
  target_ref="origin/${SYSTEM_PULLREQUEST_TARGETBRANCH#refs/heads/}"
elif git rev-parse --verify origin/main >/dev/null 2>&1; then
  target_ref="origin/main"
elif git rev-parse --verify origin/master >/dev/null 2>&1; then
  target_ref="origin/master"
fi

if [[ -z "$target_ref" ]]; then
  echo "Status: WARNING" | tee -a "$REPORT"
  echo "No target branch available; protected deletion diff was skipped." | tee -a "$REPORT"
  exit 0
fi

git fetch --all --prune >/dev/null 2>&1 || true

deleted=$(git diff --name-status "$target_ref"...HEAD 2>/dev/null | awk '$1 ~ /^D/ {print $2}' | grep -E "$protected_regex" || true)

if [[ -n "$deleted" ]]; then
  echo "Status: BLOCKED" | tee -a "$REPORT"
  echo "Protected files/folders deleted without explicit approval:" | tee -a "$REPORT"
  echo '```text' | tee -a "$REPORT"
  echo "$deleted" | tee -a "$REPORT"
  echo '```' | tee -a "$REPORT"
  exit 1
fi

echo "Status: PASS" | tee -a "$REPORT"
