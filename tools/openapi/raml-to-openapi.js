#!/usr/bin/env node
const { parseRamlContract, writeJson, writeText, toYaml } = require('../lib/common');

const contract = parseRamlContract('api.raml');
const schemas = {};
for (const t of contract.types || []) schemas[t] = { type: 'object', additionalProperties: true, description: `Schema convertido a partir do tipo RAML ${t}. Revisar manualmente se o RAML usar constraints avançadas.` };

const openapi = {
  openapi: '3.0.3',
  info: {
    title: contract.title,
    version: contract.version,
    description: 'OpenAPI gerado a partir de RAML 1.0 pela esteira Premium Guardian. Validar constraints avançadas de RAML em revisão técnica.'
  },
  servers: contract.baseUri ? [{ url: contract.baseUri }] : [],
  paths: {},
  components: {
    securitySchemes: {},
    schemas
  }
};

for (const scheme of contract.securitySchemes || []) {
  openapi.components.securitySchemes[scheme] = {
    type: 'apiKey',
    in: 'header',
    name: 'client_id',
    description: `Security scheme convertido de RAML: ${scheme}`
  };
}

for (const ep of contract.endpoints || []) {
  openapi.paths[ep.path] ||= {};
  const op = {
    operationId: `${ep.method.toLowerCase()}_${ep.path.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
    summary: ep.displayName || `${ep.method} ${ep.path}`,
    description: ep.description || '',
    parameters: [],
    responses: {}
  };
  for (const p of Object.values(ep.uriParameters || {})) op.parameters.push(paramToOpenApi(p, 'path', true));
  for (const p of Object.values(ep.queryParameters || {})) op.parameters.push(paramToOpenApi(p, 'query', Boolean(p.required)));
  for (const [code, response] of Object.entries(ep.responses || {})) {
    const media = response.body?.['application/json'];
    op.responses[code] = {
      description: response.description || `HTTP ${code}`,
      content: media ? {
        'application/json': {
          schema: schemaRef(media.type?.[0])
        }
      } : undefined
    };
    if (!op.responses[code].content) delete op.responses[code].content;
  }
  if ((ep.securedBy || []).length) op.security = ep.securedBy.map(s => ({ [s]: [] }));
  if ((ep.traits || []).length) op['x-raml-traits'] = ep.traits;
  openapi.paths[ep.path][ep.method.toLowerCase()] = op;
}

function paramToOpenApi(p, where, required) {
  const schema = { type: mapType(p.type?.[0]) };
  if (p.enum?.length) schema.enum = p.enum;
  if (p.pattern) schema.pattern = String(p.pattern);
  if (p.default !== null && p.default !== undefined) schema.default = p.default;
  return { name: p.name, in: where, required, description: p.description || '', schema };
}
function mapType(t) {
  t = String(t || 'string').toLowerCase();
  if (['boolean','integer','number','array','object','string'].includes(t)) return t;
  return 'string';
}
function schemaRef(t) {
  if (t && schemas[t]) return { $ref: `#/components/schemas/${t}` };
  return { type: 'object', additionalProperties: true };
}

writeJson('dist/openapi/openapi.json', openapi);
writeText('dist/openapi/openapi.yaml', toYaml(openapi) + '\n');

const report = [
  '# RAML to OpenAPI Report',
  '',
  `Status: PASS`,
  `OpenAPI version: ${openapi.openapi}`,
  `Paths generated: ${Object.keys(openapi.paths).length}`,
  `Operations generated: ${contract.endpoints.length}`,
  '',
  '## Observação',
  '',
  'Conversão local sem dependências externas. Para contratos RAML com constraints avançadas, recomenda-se validar também com AMF/Spectral corporativo.'
];
writeText('dist/reports/raml-to-openapi-report.md', report.join('\n') + '\n');
console.log(`[PASS] OpenAPI generated: ${contract.endpoints.length} operation(s).`);
