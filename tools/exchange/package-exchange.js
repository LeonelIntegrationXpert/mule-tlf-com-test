#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ensureDir, writeText, writeJson } = require('../lib/common');

ensureDir('dist/exchange-package');
const files = ['api.raml'];
const dirs = ['types','traits','resourceTypes','examples','libraries','securitySchemes'];
for (const f of files) if (fs.existsSync(f)) fs.copyFileSync(f, path.join('dist/exchange-package', f));
for (const d of dirs) copyDir(d, path.join('dist/exchange-package', d));
if (fs.existsSync('dist/openapi/openapi.yaml')) {
  ensureDir('dist/exchange-package/openapi');
  fs.copyFileSync('dist/openapi/openapi.yaml', 'dist/exchange-package/openapi/openapi.yaml');
  fs.copyFileSync('dist/openapi/openapi.json', 'dist/exchange-package/openapi/openapi.json');
}
writeJson('dist/exchange-package/exchange-package-manifest.json', { generatedAt: new Date().toISOString(), mainFile: 'api.raml', includesOpenApi: fs.existsSync('dist/openapi/openapi.yaml') });
writeText('dist/reports/exchange-package-report.md', '# Exchange Package Report\n\nStatus: PASS\n\nPackage folder: dist/exchange-package\n');
console.log('[PASS] Exchange package prepared at dist/exchange-package.');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else { ensureDir(path.dirname(to)); fs.copyFileSync(from, to); }
  }
}
