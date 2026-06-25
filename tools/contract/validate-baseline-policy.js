#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson, exists } = require('../lib/common');

const branch = process.env.BUILD_SOURCEBRANCH || process.env.GITHUB_REF || process.env.BRANCH_NAME || '';
const isPr = Boolean(process.env.SYSTEM_PULLREQUEST_TARGETBRANCH || process.env.GITHUB_BASE_REF || process.env.BUILD_REASON === 'PullRequest');
const isStableBranch = ['refs/heads/main','refs/heads/master','main','master'].includes(branch);
const findings = [];
function f(severity, message) { findings.push({ severity, message }); }

if (!exists('release/api-contract-baseline.json')) f('BLOCKER', 'Baseline oficial ausente: release/api-contract-baseline.json');
if (isPr && exists('release/api-contract-baseline.json')) f('INFO', 'PR detectado: baseline oficial não deve ser atualizado; use baseline candidate.');
if (!isStableBranch) f('INFO', `Branch não estável (${branch || 'local'}): baseline oficial não deve ser atualizado.`);

let status = findings.some(x => x.severity === 'BLOCKER') ? 'BLOCKED' : 'PASS';
const md = ['# Baseline Policy Validation', '', `Branch: ${branch || 'local'}`, `Is PR: ${isPr}`, `Stable branch: ${isStableBranch}`, '', ...findings.map(x => `- ${x.severity}: ${x.message}`), '', `Status: ${status}`];
writeText('dist/reports/baseline-policy-report.md', md.join('\n') + '\n');
writeJson('dist/reports/baseline-policy-report.json', { status, branch, isPr, isStableBranch, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] baseline policy validation.`);
if (status === 'BLOCKED') process.exit(1);
