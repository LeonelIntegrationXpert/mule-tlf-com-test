#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson, exists } = require('../lib/common');

const sources = [
  'dist/reports/structure-guard-report.md',
  'dist/reports/conflict-marker-report.md',
  'dist/reports/security-scan-report.md',
  'dist/reports/protected-files-report.md',
  'dist/reports/raml-lint-report.md',
  'dist/reports/openapi-lint-report.md',
  'dist/reports/raml-to-openapi-diff.md',
  'dist/reports/contract-diff.md',
  'dist/reports/breaking-changes-validation.md',
  'dist/reports/baseline-policy-report.md'
];
const statuses = [];
for (const file of sources) {
  if (!exists(file)) { statuses.push({ file, status: 'MISSING' }); continue; }
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/Status:\s*(BLOCKED|PASS|WARNING|READY_FOR_REVIEW)/i);
  statuses.push({ file, status: m ? m[1].toUpperCase() : 'UNKNOWN' });
}
let finalStatus = 'PASS';
if (statuses.some(s => ['BLOCKED','MISSING'].includes(s.status))) finalStatus = 'BLOCKED';
else if (statuses.some(s => ['WARNING','UNKNOWN','READY_FOR_REVIEW'].includes(s.status))) finalStatus = 'WARNING';

const diff = exists('dist/api-contract-diff.json') ? JSON.parse(fs.readFileSync('dist/api-contract-diff.json', 'utf8')) : null;
if (diff?.status === 'BLOCKED') finalStatus = 'BLOCKED';

const md = [
  '# Premium Guardian Final Summary',
  '',
  `Status final: **${finalStatus}**`,
  '',
  '## Checks',
  '',
  ...statuses.map(s => `- ${s.status}: ${s.file}`),
  '',
  '## Regra de ouro',
  '',
  'Se qualquer Contract Guard estiver BLOCKED, o relatório final também fica BLOCKED e o publish no Exchange deve ser proibido.',
  ''
];
if (diff) {
  md.push('## Contract Diff Summary', '');
  for (const [k, v] of Object.entries(diff.summary || {})) md.push(`- ${k}: ${v}`);
  md.push('');
}
writeText('dist/reports/final-summary.md', md.join('\n') + '\n');
writeJson('dist/reports/final-summary.json', { status: finalStatus, statuses, diffSummary: diff?.summary || null, generatedAt: new Date().toISOString() });
console.log(`[${finalStatus}] final summary.`);
if (finalStatus === 'BLOCKED') process.exit(1);
