#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson, exists } = require('../lib/common');

const requiredEnv = [
  'ANYPOINT_CONNECTED_APP_CLIENT_ID',
  'ANYPOINT_CONNECTED_APP_CLIENT_SECRET',
  'ANYPOINT_ORG',
  'ANYPOINT_HOST',
  'EXCHANGE_GROUP_ID'
];
const findings = [];
function add(severity, message) { findings.push({ severity, message }); }

if (!exists('api.raml')) add('BLOCKER', 'api.raml ausente.');
if (!exists('dist/openapi/openapi.yaml')) add('HIGH', 'OpenAPI YAML ainda não foi gerado.');
if (!exists('dist/api-contract-diff.json')) add('HIGH', 'Contract diff ainda não foi gerado.');
if (exists('dist/api-contract-diff.json')) {
  const diff = JSON.parse(fs.readFileSync('dist/api-contract-diff.json', 'utf8'));
  if (diff.status === 'BLOCKED') add('BLOCKER', 'Contract Guard está BLOCKED. Publish Exchange proibido.');
}
for (const env of requiredEnv) {
  if (!process.env[env]) add('BLOCKER', `Variável obrigatória ausente para publish: ${env}`);
}
const branch = process.env.BUILD_SOURCEBRANCH || process.env.GITHUB_REF || '';
if (branch && !['refs/heads/main','refs/heads/master'].includes(branch)) add('BLOCKER', `Publish permitido somente em main/master. Branch atual: ${branch}`);

const status = findings.some(f => f.severity === 'BLOCKER') ? 'BLOCKED' : findings.length ? 'WARNING' : 'PASS';
const md = ['# Exchange Preflight Report', '', `Status: ${status}`, '', ...findings.map(f => `- ${f.severity}: ${f.message}`)];
writeText('dist/reports/exchange-preflight-report.md', md.join('\n') + '\n');
writeJson('dist/reports/exchange-preflight-report.json', { status, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] Exchange preflight.`);
if (status === 'BLOCKED') process.exit(1);
