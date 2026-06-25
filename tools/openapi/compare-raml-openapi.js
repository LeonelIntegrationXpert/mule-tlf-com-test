#!/usr/bin/env node
const fs = require('fs');
const { parseRamlContract, writeText, writeJson, exists } = require('../lib/common');

const findings = [];
if (!exists('dist/openapi/openapi.json')) findings.push({ severity: 'BLOCKER', message: 'OpenAPI JSON não encontrado.' });
const contract = parseRamlContract('api.raml');
let api = null;
if (!findings.length) api = JSON.parse(fs.readFileSync('dist/openapi/openapi.json', 'utf8'));
if (api) {
  for (const ep of contract.endpoints || []) {
    const pathObj = api.paths?.[ep.path];
    if (!pathObj) { findings.push({ severity: 'BLOCKER', message: `Path perdido na conversão: ${ep.path}` }); continue; }
    if (!pathObj[ep.method.toLowerCase()]) findings.push({ severity: 'BLOCKER', message: `Method perdido na conversão: ${ep.method} ${ep.path}` });
    const op = pathObj[ep.method.toLowerCase()] || {};
    for (const [name, p] of Object.entries(ep.queryParameters || {})) {
      if (p.required && !(op.parameters || []).some(x => x.in === 'query' && x.name === name)) findings.push({ severity: 'HIGH', message: `Query param obrigatório perdido: ${ep.id} ${name}` });
    }
    for (const code of Object.keys(ep.responses || {}).filter(c => /^2/.test(c))) {
      if (!op.responses?.[code]) findings.push({ severity: 'BLOCKER', message: `Response 2xx perdido: ${ep.id} ${code}` });
    }
  }
}
const status = findings.some(f => f.severity === 'BLOCKER') ? 'BLOCKED' : findings.length ? 'WARNING' : 'PASS';
const md = ['# RAML x OpenAPI Comparison', '', `Status: ${status}`, '', ...findings.map(f => `- ${f.severity}: ${f.message}`)];
writeText('dist/reports/raml-to-openapi-diff.md', md.join('\n') + '\n');
writeJson('dist/reports/raml-to-openapi-diff.json', { status, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] RAML/OpenAPI comparison.`);
if (status === 'BLOCKED') process.exit(1);
