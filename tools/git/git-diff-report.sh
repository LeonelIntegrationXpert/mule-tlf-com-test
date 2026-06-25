#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/reports

STATUS="dist/reports/git-status.txt"
NAME_STATUS="dist/reports/git-diff-name-status.txt"
STAT="dist/reports/git-diff-stat.txt"
REPORT="dist/reports/git-diff-report.md"

git status --short > "$STATUS" || true

target_ref=""
if [[ -n "${SYSTEM_PULLREQUEST_TARGETBRANCH:-}" ]]; then
  target_ref="origin/${SYSTEM_PULLREQUEST_TARGETBRANCH#refs/heads/}"
elif git rev-parse --verify origin/main >/dev/null 2>&1; then
  target_ref="origin/main"
elif git rev-parse --verify origin/master >/dev/null 2>&1; then
  target_ref="origin/master"
fi

if [[ -n "$target_ref" ]]; then
  git fetch --all --prune >/dev/null 2>&1 || true
  git diff --name-status "$target_ref"...HEAD > "$NAME_STATUS" 2>/dev/null || true
  git diff --stat "$target_ref"...HEAD > "$STAT" 2>/dev/null || true
else
  echo "No target branch available" > "$NAME_STATUS"
  echo "No target branch available" > "$STAT"
fi

{
  echo "# Git Diff Evidence"
  echo ""
  echo "Target ref: ${target_ref:-not available}"
  echo ""
  echo "## Git status"
  echo '```text'
  cat "$STATUS"
  echo '```'
  echo ""
  echo "## Name status"
  echo '```text'
  cat "$NAME_STATUS"
  echo '```'
  echo ""
  echo "## Diff stat"
  echo '```text'
  cat "$STAT"
  echo '```'
} > "$REPORT"
