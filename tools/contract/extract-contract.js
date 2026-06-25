#!/usr/bin/env node
const { parseRamlContract, writeJson, writeText } = require('../lib/common');

const contract = parseRamlContract('api.raml');
writeJson('dist/api-contract-current.json', contract);

const lines = ['# API Contract Inventory', '', `Source: ${contract.sourceFile}`, `Generated at: ${contract.generatedAt}`, '', `Endpoints: ${contract.endpoints.length}`, ''];
for (const ep of contract.endpoints) {
  lines.push(`- ${ep.method} ${ep.path}`);
  const q = Object.values(ep.queryParameters || {});
  if (q.length) lines.push(`  - queryParams: ${q.map(x => `${x.name}${x.required ? ' (required)' : ''}`).join(', ')}`);
  const r = Object.keys(ep.responses || {});
  if (r.length) lines.push(`  - responses: ${r.join(', ')}`);
}
writeText('dist/reports/api-contract-current.md', lines.join('\n') + '\n');
console.log(`[PASS] Contract extracted: ${contract.endpoints.length} endpoint(s).`);
