#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson, exists } = require('../lib/common');

const findings = [];
function add(severity, message) { findings.push({ severity, message }); }
if (!exists('dist/openapi/openapi.json')) add('BLOCKER', 'dist/openapi/openapi.json não encontrado. Rode npm run raml:to-openapi.');
let api = null;
if (!findings.length) {
  try { api = JSON.parse(fs.readFileSync('dist/openapi/openapi.json', 'utf8')); } catch (e) { add('BLOCKER', `JSON inválido: ${e.message}`); }
}
if (api) {
  if (!/^3\.0\.|^3\.1\./.test(api.openapi || '')) add('BLOCKER', 'Versão OpenAPI deve ser 3.0.x ou 3.1.x.');
  if (!api.info?.title) add('BLOCKER', 'info.title ausente.');
  if (!api.info?.version) add('BLOCKER', 'info.version ausente.');
  const paths = Object.keys(api.paths || {});
  if (!paths.length) add('BLOCKER', 'Nenhum path OpenAPI encontrado.');
  for (const p of paths) {
    const ops = Object.keys(api.paths[p] || {}).filter(x => ['get','post','put','patch','delete','head','options'].includes(x));
    if (!ops.length) add('HIGH', `Path sem operação HTTP: ${p}`);
    for (const op of ops) {
      if (!api.paths[p][op].operationId) add('MEDIUM', `operationId ausente: ${op.toUpperCase()} ${p}`);
      if (!api.paths[p][op].responses || !Object.keys(api.paths[p][op].responses).length) add('BLOCKER', `responses ausente: ${op.toUpperCase()} ${p}`);
    }
  }
}
const status = findings.some(f => f.severity === 'BLOCKER') ? 'BLOCKED' : findings.length ? 'WARNING' : 'PASS';
const md = ['# OpenAPI Validation Report', '', `Status: ${status}`, '', ...findings.map(f => `- ${f.severity}: ${f.message}`)];
writeText('dist/reports/openapi-lint-report.md', md.join('\n') + '\n');
writeJson('dist/reports/openapi-lint-report.json', { status, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] OpenAPI validation.`);
if (status === 'BLOCKED') process.exit(1);
