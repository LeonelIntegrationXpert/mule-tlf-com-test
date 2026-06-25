#!/usr/bin/env node
const fs = require('fs');
const { parseRamlContract, writeJson, writeText, similarity, exists } = require('../lib/common');

const baselineFile = 'release/api-contract-baseline.json';
const currentFile = 'dist/api-contract-current.json';
const current = exists(currentFile) ? JSON.parse(fs.readFileSync(currentFile, 'utf8')) : parseRamlContract('api.raml');
const baseline = exists(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : null;

let status = 'PASS';
const blocks = [];
const warnings = [];
const addedEndpoints = [];
const removedEndpoints = [];
const possibleReplacements = [];

if (!baseline) {
  status = 'WARNING';
  warnings.push({ type: 'baseline-missing', message: `Baseline não encontrado: ${baselineFile}` });
} else {
  const baseById = new Map((baseline.endpoints || []).map(e => [e.id, e]));
  const currById = new Map((current.endpoints || []).map(e => [e.id, e]));
  for (const ep of current.endpoints || []) if (!baseById.has(ep.id)) addedEndpoints.push(ep);
  for (const ep of baseline.endpoints || []) if (!currById.has(ep.id)) removedEndpoints.push(ep);

  for (const removed of removedEndpoints) {
    blocks.push({ type: 'removed-endpoint', endpoint: removed.id, severity: 'BLOCKER', message: 'Endpoint removido sem aprovação válida.' });
    for (const added of addedEndpoints) {
      const score = similarity(`${removed.method} ${removed.path}`, `${added.method} ${added.path}`);
      if (score >= 85) {
        possibleReplacements.push({ oldMethod: removed.method, oldPath: removed.path, newMethod: added.method, newPath: added.path, similarityScore: score, severity: 'BLOCKER' });
      }
    }
  }

  for (const curr of current.endpoints || []) {
    const prev = baseById.get(curr.id);
    if (!prev) continue;
    for (const [name, param] of Object.entries(prev.queryParameters || {})) {
      if (param.required && !(curr.queryParameters || {})[name]) blocks.push({ type: 'removed-required-query-param', endpoint: curr.id, param: name, severity: 'BLOCKER' });
    }
    for (const [name] of Object.entries(prev.uriParameters || {})) {
      if (!(curr.uriParameters || {})[name]) blocks.push({ type: 'removed-uri-param', endpoint: curr.id, param: name, severity: 'BLOCKER' });
    }
    const prev2xx = Object.keys(prev.responses || {}).filter(x => /^2/.test(x));
    const currResponses = curr.responses || {};
    for (const code of prev2xx) if (!currResponses[code]) blocks.push({ type: 'removed-success-response', endpoint: curr.id, response: code, severity: 'BLOCKER' });
  }
}

if (blocks.length) status = 'BLOCKED';
else if (warnings.length) status = 'WARNING';

const diff = {
  generatedAt: new Date().toISOString(),
  status,
  baselineSource: baselineFile,
  currentSource: 'api.raml',
  summary: {
    previousEndpoints: baseline?.endpoints?.length || 0,
    currentEndpoints: current.endpoints?.length || 0,
    addedEndpoints: addedEndpoints.length,
    removedEndpoints: removedEndpoints.length,
    possibleReplacements: possibleReplacements.length,
    blocks: blocks.length,
    warnings: warnings.length
  },
  addedEndpoints,
  removedEndpoints,
  possibleReplacements,
  blocks,
  warnings
};
writeJson('dist/api-contract-diff.json', diff);

const md = ['# API Contract Diff', '', `Status: **${status}**`, '', '## Summary', '', ...Object.entries(diff.summary).map(([k,v]) => `- ${k}: ${v}`), ''];
if (possibleReplacements.length) {
  md.push('## Possible endpoint replacements', '');
  for (const p of possibleReplacements) md.push(`- ${p.oldMethod} ${p.oldPath} -> ${p.newMethod} ${p.newPath} (${p.similarityScore}%)`);
  md.push('');
}
if (blocks.length) {
  md.push('## Blockers', '');
  for (const b of blocks) md.push(`- ${b.type}: ${b.endpoint || ''} ${b.param || ''} ${b.response || ''}`.trim());
  md.push('');
}
writeText('dist/reports/contract-diff.md', md.join('\n') + '\n');
writeText('dist/api-contract-diff.md', md.join('\n') + '\n');
console.log(`[${status}] Contract diff completed. Blockers: ${blocks.length}.`);
if (status === 'BLOCKED') process.exit(1);
