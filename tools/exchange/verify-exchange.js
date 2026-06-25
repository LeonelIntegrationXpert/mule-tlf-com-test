#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson } = require('../lib/common');
const findings = [];
if (!fs.existsSync('dist/exchange-package/api.raml')) findings.push({ severity: 'BLOCKER', message: 'Package sem api.raml.' });
if (!fs.existsSync('dist/exchange-package/openapi/openapi.yaml')) findings.push({ severity: 'WARNING', message: 'Package sem openapi.yaml.' });
const status = findings.some(f => f.severity === 'BLOCKER') ? 'BLOCKED' : findings.length ? 'WARNING' : 'PASS';
writeText('dist/reports/exchange-verify-report.md', ['# Exchange Verify Report', '', `Status: ${status}`, '', ...findings.map(f => `- ${f.severity}: ${f.message}`)].join('\n') + '\n');
writeJson('dist/reports/exchange-verify-report.json', { status, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] Exchange package verification.`);
if (status === 'BLOCKED') process.exit(1);
