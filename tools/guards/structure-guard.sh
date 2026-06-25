#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/reports
REPORT="dist/reports/structure-guard-report.md"
: > "$REPORT"
fail=0

log() { echo "$1" | tee -a "$REPORT"; }

log "# Structure Guard"
log ""

required_files=(
  "api.raml"
  "release/guardian.config.yml"
  "release/release-manifest.yml"
  "release/breaking-changes.yml"
  "release/api-contract-baseline.json"
  "package.json"
)
required_dirs=(
  "types"
  "traits"
  "examples"
  "securitySchemes"
  "tools"
)

for f in "${required_files[@]}"; do
  if [[ -f "$f" ]]; then
    log "- PASS file: $f"
  else
    log "- BLOCK file missing: $f"
    fail=1
  fi
done

for d in "${required_dirs[@]}"; do
  if [[ -d "$d" ]]; then
    log "- PASS dir: $d"
  else
    log "- BLOCK dir missing: $d"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  log ""
  log "Status: BLOCKED"
  exit 1
fi

log ""
log "Status: PASS"
