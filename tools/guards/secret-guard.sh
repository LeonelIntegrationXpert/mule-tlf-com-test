#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/reports
REPORT="dist/reports/security-scan-report.md"
: > "$REPORT"

echo "# Secret Guard" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

fail=0

if git ls-files 2>/dev/null | grep -E '(^|/)\.env$|settings-local\.xml$|\.p12$|\.jks$|\.pem$|\.key$' >/tmp/secret-files.txt; then
  if [[ -s /tmp/secret-files.txt ]]; then
    echo "## BLOCKED files" | tee -a "$REPORT"
    cat /tmp/secret-files.txt | tee -a "$REPORT"
    fail=1
  fi
fi

scan_args=(--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=release/backups --exclude-dir=docs --exclude='*.md' --exclude='package-lock.json')

auth_matches=$(grep -RIn "${scan_args[@]}" -E 'Authorization:[[:space:]]*Basic[[:space:]][A-Za-z0-9+/=]{20,}' . || true)
secret_matches=$(grep -RIn "${scan_args[@]}" -E '(client_secret|clientSecret|password|passwd)[[:space:]]*[:=][[:space:]]*["'"''][^$\{][^"'"'']{6,}' . || true)
key_matches=$(grep -RIn "${scan_args[@]}" -E -- '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----' . || true)

matches="${auth_matches}${secret_matches}${key_matches}"

if [[ -n "$matches" ]]; then
  echo "" | tee -a "$REPORT"
  echo "## BLOCKED patterns" | tee -a "$REPORT"
  echo '```text' | tee -a "$REPORT"
  printf "%s\n" "$matches" | sed -E 's/(Basic )[A-Za-z0-9+/=]+/\1***MASKED***/g; s/((client_secret|clientSecret|password|passwd)[[:space:]]*[:=][[:space:]]*["'"''])[^"'"'']+/\1***MASKED***/Ig' | tee -a "$REPORT"
  echo '```' | tee -a "$REPORT"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  echo "" | tee -a "$REPORT"
  echo "Status: BLOCKED" | tee -a "$REPORT"
  exit 1
fi

echo "Status: PASS" | tee -a "$REPORT"
