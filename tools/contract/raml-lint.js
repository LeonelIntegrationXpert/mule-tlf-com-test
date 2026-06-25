#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ensureDir, writeText } = require('../lib/common');

ensureDir('dist/reports');
const report = [];
let blocked = false;
function add(s='') { report.push(s); }
function block(s) { blocked = true; add(`- BLOCK: ${s}`); }
function pass(s) { add(`- PASS: ${s}`); }
function warn(s) { add(`- WARNING: ${s}`); }

add('# RAML Lint Report');
add('');

if (!fs.existsSync('api.raml')) {
  block('api.raml não encontrado.');
} else {
  const text = fs.readFileSync('api.raml', 'utf8');
  if (!text.startsWith('#%RAML 1.0')) block('api.raml precisa iniciar com #%RAML 1.0.'); else pass('Header RAML 1.0 encontrado.');
  for (const field of ['title:', 'version:', 'baseUri:']) {
    if (!text.includes(field)) block(`Campo obrigatório ausente: ${field}`); else pass(`Campo encontrado: ${field}`);
  }
  const includes = [...text.matchAll(/!include\s+([^\s]+)/g)].map(m => m[1].trim());
  add(''); add(`Includes encontrados: ${includes.length}`);
  for (const inc of includes) {
    const clean = inc.replace(/["']/g, '');
    if (!fs.existsSync(clean)) block(`Include não encontrado: ${clean}`); else pass(`Include OK: ${clean}`);
  }
  const endpointCount = (text.match(/^\/[A-Za-z0-9_{}.$()\-\/]+:/gm) || []).length;
  if (!endpointCount) block('Nenhum recurso/path RAML encontrado.'); else pass(`Recursos/path encontrados: ${endpointCount}`);
}

add('');
add(`Status: ${blocked ? 'BLOCKED' : 'PASS'}`);
writeText('dist/reports/raml-lint-report.md', report.join('\n') + '\n');
if (blocked) process.exit(1);
