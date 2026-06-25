const fs = require('fs');
const path = require('path');

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readText(file) { return fs.readFileSync(file, 'utf8'); }
function writeJson(file, data) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }
function writeText(file, text) { ensureDir(path.dirname(file)); fs.writeFileSync(file, text); }
function exists(file) { return fs.existsSync(file); }
function now() { return new Date().toISOString(); }
function normalizeArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function mask(value) { return value ? '***MASKED***' : ''; }

function extractBracketList(text) {
  const m = text.match(/\[([^\]]*)\]/);
  if (!m) return [];
  return m[1].split(',').map(x => x.trim()).filter(Boolean);
}

function simpleYamlString(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  const s = String(value);
  if (/^[A-Za-z0-9_./{}:-]+$/.test(s) && !s.includes(': ')) return s;
  return JSON.stringify(s);
}

function toYaml(obj, indent = 0) {
  const sp = ' '.repeat(indent);
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]';
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        const y = toYaml(item, indent + 2);
        return `${sp}- ${y.startsWith('\n') ? y.slice(1) : '\n' + y}`;
      }
      return `${sp}- ${simpleYamlString(item)}`;
    }).join('\n');
  }
  if (typeof obj === 'object' && obj !== null) {
    const lines = [];
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        if (!v.length) lines.push(`${sp}${k}: []`);
        else lines.push(`${sp}${k}:\n${toYaml(v, indent + 2)}`);
      } else if (typeof v === 'object' && v !== null) {
        lines.push(`${sp}${k}:\n${toYaml(v, indent + 2)}`);
      } else {
        lines.push(`${sp}${k}: ${simpleYamlString(v)}`);
      }
    }
    return lines.join('\n');
  }
  return simpleYamlString(obj);
}

function parseRootMetadata(raml) {
  const meta = {};
  for (const line of raml.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/);
    if (!m) continue;
    if (['title','version','baseUri','mediaType'].includes(m[1])) meta[m[1]] = m[2].trim();
    if (m[1] === 'protocols') meta.protocols = extractBracketList(m[2]);
  }
  return meta;
}

function parseNamedIncludes(raml, sectionName) {
  const lines = raml.split(/\r?\n/);
  const items = [];
  let inSection = false;
  for (const line of lines) {
    if (line.match(new RegExp(`^${sectionName}:\\s*$`))) { inSection = true; continue; }
    if (inSection && /^\S/.test(line) && !line.startsWith('/')) break;
    if (inSection) {
      const m = line.match(/^\s{2}([A-Za-z0-9_-]+):/);
      if (m) items.push(m[1]);
    }
  }
  return items.sort();
}

function parseRamlContract(file = 'api.raml') {
  const raml = readText(file);
  const lines = raml.split(/\r?\n/);
  const meta = parseRootMetadata(raml);
  const securitySchemes = parseNamedIncludes(raml, 'securitySchemes');
  const traits = parseNamedIncludes(raml, 'traits');
  const types = parseNamedIncludes(raml, 'types');
  const securedByRoot = (raml.match(/^securedBy:\s*\[([^\]]*)\]/m) || [])[1];

  const endpoints = [];
  const stack = [];
  let currentEndpoint = null;
  let context = null;
  let currentResponse = null;
  let currentQueryParam = null;
  let currentUriParam = null;

  function fullPathAt(indent, part) {
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    stack.push({ indent, part });
    return stack.map(x => x.part).join('').replace(/\/\//g, '/');
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const indent = raw.match(/^\s*/)[0].length;
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const resource = raw.match(/^(\s*)(\/[A-Za-z0-9_{}.$()\-\/]+):\s*$/);
    if (resource) {
      const fullPath = fullPathAt(indent, line.slice(0, -1));
      currentEndpoint = null;
      context = { type: 'resource', path: fullPath, indent };
      continue;
    }

    const method = raw.match(/^(\s{2,})(get|post|put|patch|delete|head|options):\s*$/i);
    if (method && stack.length) {
      const methodName = method[2].toUpperCase();
      const pathValue = stack.map(x => x.part).join('').replace(/\/\//g, '/');
      currentEndpoint = {
        id: `${methodName} ${pathValue}`,
        method: methodName,
        path: pathValue,
        displayName: null,
        description: '',
        queryParameters: {},
        uriParameters: {},
        headers: {},
        body: {},
        responses: {},
        securedBy: securedByRoot ? securedByRoot.split(',').map(x => x.trim()).filter(Boolean) : securitySchemes,
        traits: [],
        protocols: meta.protocols || [],
        line: i + 1
      };
      endpoints.push(currentEndpoint);
      context = { type: 'method', indent };
      currentResponse = null;
      currentQueryParam = null;
      currentUriParam = null;
      continue;
    }

    if (!currentEndpoint) {
      const uriSection = raw.match(/^\s+uriParameters:\s*$/);
      if (uriSection && stack.length) context = { type: 'uriParametersRoot', resourcePath: stack.map(x => x.part).join(''), indent };
      continue;
    }

    if (/^displayName:\s*/.test(line)) currentEndpoint.displayName = line.replace(/^displayName:\s*/, '').trim();
    if (/^is:\s*\[/.test(line)) currentEndpoint.traits = extractBracketList(line);

    if (/^queryParameters:\s*$/.test(line)) { context = { type: 'queryParameters', indent }; currentQueryParam = null; continue; }
    if (/^uriParameters:\s*$/.test(line)) { context = { type: 'uriParameters', indent }; currentUriParam = null; continue; }
    if (/^headers:\s*$/.test(line)) { context = { type: 'headers', indent }; continue; }
    if (/^body:\s*$/.test(line)) { context = { type: 'body', indent }; continue; }
    if (/^responses:\s*$/.test(line)) { context = { type: 'responses', indent }; currentResponse = null; continue; }

    if (context?.type === 'queryParameters') {
      const p = raw.match(/^\s{6,}([A-Za-z0-9_-]+):\s*$/);
      if (p) { currentQueryParam = p[1]; currentEndpoint.queryParameters[currentQueryParam] = { name: currentQueryParam, required: false, type: ['string'], enum: [], pattern: null, default: null, description: null }; continue; }
      if (currentQueryParam) assignParam(currentEndpoint.queryParameters[currentQueryParam], line);
    }

    if (context?.type === 'uriParameters') {
      const p = raw.match(/^\s{4,}([A-Za-z0-9_-]+):\s*$/);
      if (p) { currentUriParam = p[1]; currentEndpoint.uriParameters[currentUriParam] = { name: currentUriParam, required: true, type: ['string'], enum: [], pattern: null, default: null, description: null }; continue; }
      if (currentUriParam) assignParam(currentEndpoint.uriParameters[currentUriParam], line);
    }

    if (context?.type === 'responses') {
      const r = raw.match(/^\s{6,}([0-9]{3}):\s*$/);
      if (r) { currentResponse = r[1]; currentEndpoint.responses[currentResponse] = { code: currentResponse, description: null, body: {} }; continue; }
      if (currentResponse && /^description:\s*/.test(line)) currentEndpoint.responses[currentResponse].description = line.replace(/^description:\s*/, '').trim();
      if (currentResponse && /^type:\s*/.test(line)) {
        const t = line.replace(/^type:\s*/, '').trim();
        currentEndpoint.responses[currentResponse].body['application/json'] = { mediaType: 'application/json', type: [t], required: false };
      }
    }
  }

  return {
    contractVersion: '1.0',
    sourceFile: file,
    generatedAt: now(),
    title: meta.title || path.basename(process.cwd()),
    version: meta.version || 'v1',
    baseUri: meta.baseUri || '',
    protocols: meta.protocols || [],
    securitySchemes,
    traits,
    types,
    endpoints
  };
}

function assignParam(param, line) {
  if (/^required:\s*/.test(line)) param.required = /true/i.test(line);
  if (/^type:\s*/.test(line)) param.type = [line.replace(/^type:\s*/, '').trim()];
  if (/^enum:\s*\[/.test(line)) param.enum = extractBracketList(line);
  if (/^pattern:\s*/.test(line)) param.pattern = line.replace(/^pattern:\s*/, '').trim();
  if (/^default:\s*/.test(line)) param.default = line.replace(/^default:\s*/, '').trim();
  if (/^description:\s*/.test(line)) param.description = line.replace(/^description:\s*/, '').trim();
}

function similarity(a, b) {
  a = String(a || ''); b = String(b || '');
  const dp = Array.from({length: a.length + 1}, () => Array(b.length + 1).fill(0));
  for (let i=0;i<=a.length;i++) dp[i][0] = i;
  for (let j=0;j<=b.length;j++) dp[0][j] = j;
  for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++) {
    dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  }
  const dist = dp[a.length][b.length];
  return Math.round((1 - dist / Math.max(a.length, b.length, 1)) * 100);
}

module.exports = { ensureDir, readText, writeJson, writeText, exists, now, toYaml, parseRamlContract, similarity, normalizeArray, mask };
