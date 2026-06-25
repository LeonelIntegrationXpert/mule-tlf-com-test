#!/usr/bin/env node
const fs = require('fs');
const { writeText, writeJson, exists } = require('../lib/common');

const file = 'release/breaking-changes.yml';
const report = ['# Breaking Changes Approval Validation', ''];
const findings = [];
function add(severity, message) { findings.push({ severity, message }); report.push(`- ${severity}: ${message}`); }

if (!exists(file)) {
  add('BLOCKER', `${file} não encontrado.`);
} else {
  const txt = fs.readFileSync(file, 'utf8');
  const approved = /approved:\s*true/i.test(txt);
  const allowAll = /allowAllBreakingChanges:\s*true/i.test(txt);
  const ticket = (txt.match(/ticket:\s*['"]?([^\n'"]+)/i) || [])[1]?.trim();
  const approvedBy = (txt.match(/approvedBy:\s*['"]?([^\n'"]+)/i) || [])[1]?.trim();
  const reason = (txt.match(/reason:\s*['"]?([^\n'"]+)/i) || [])[1]?.trim();
  const approvedAt = (txt.match(/approvedAt:\s*['"]?([^\n'"]+)/i) || [])[1]?.trim();
  const hasItems = /(removedEndpoints|removedMethods|removedQueryParams|removedUriParams|removedResponses|removedSecurity|removedTraits|changedEndpoints|replacedEndpoints):\s*\n\s*-\s+/m.test(txt);
  const ticketOk = ticket && /^(CHG|INC|RLM|JIRA|ADO|US|TASK)[A-Za-z0-9_-]{3,}$/i.test(ticket);
  const approverOk = approvedBy && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(approvedBy);
  const reasonOk = reason && reason.length >= 20 && !/^(teste|test|abc|dsf|dsfsdf|lkç|klç|çkl)/i.test(reason);
  const dateOk = approvedAt && !Number.isNaN(Date.parse(approvedAt));

  if (allowAll) add('BLOCKER', 'allowAllBreakingChanges=true não é permitido na esteira premium.');
  if (approved) {
    if (!ticketOk) add('BLOCKER', 'Aprovação de breaking change exige ticket válido: CHG*, INC*, RLM*, JIRA*, ADO*, US* ou TASK*.');
    if (!approverOk) add('BLOCKER', 'approvedBy precisa ser e-mail válido.');
    if (!reasonOk) add('BLOCKER', 'reason precisa ter no mínimo 20 caracteres úteis.');
    if (!dateOk) add('BLOCKER', 'approvedAt obrigatório em formato de data ISO.');
    if (!hasItems) add('BLOCKER', 'approved=true exige pelo menos um item específico aprovado. Aprovação genérica é bloqueada.');
  }
  if (!approved) report.push('- PASS: Nenhuma aprovação de breaking change ativa.');
}

const status = findings.some(f => f.severity === 'BLOCKER') ? 'BLOCKED' : 'PASS';
report.push('', `Status: ${status}`);
writeText('dist/reports/breaking-changes-validation.md', report.join('\n') + '\n');
writeJson('dist/reports/breaking-changes-validation.json', { status, findings, generatedAt: new Date().toISOString() });
console.log(`[${status}] breaking-changes.yml validation.`);
if (status === 'BLOCKED') process.exit(1);
