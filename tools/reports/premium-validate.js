#!/usr/bin/env node
const { spawnSync } = require('child_process');

const steps = [
  ['raml:lint', ['npm', ['run', 'raml:lint']]],
  ['raml:extract', ['npm', ['run', 'raml:extract']]],
  ['raml:to-openapi', ['npm', ['run', 'raml:to-openapi']]],
  ['openapi:validate', ['npm', ['run', 'openapi:validate']]],
  ['openapi:compare', ['npm', ['run', 'openapi:compare']]],
  ['contract:diff', ['npm', ['run', 'contract:diff']]],
  ['breaking:validate', ['npm', ['run', 'breaking:validate']]],
  ['baseline:validate', ['npm', ['run', 'baseline:validate']]],
  ['final:summary', ['npm', ['run', 'final:summary']]]
];

const failed = [];
for (const [name, [cmd, args]] of steps) {
  console.log(`\n============================================================`);
  console.log(`STEP: ${name}`);
  console.log(`============================================================`);
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) failed.push({ name, status: result.status });
}

if (failed.length) {
  console.error(`\n[BLOCKED] Premium validation finished with ${failed.length} failed step(s).`);
  for (const f of failed) console.error(`- ${f.name}: exit ${f.status}`);
  process.exit(1);
}
console.log('\n[PASS] Premium validation finished successfully.');
