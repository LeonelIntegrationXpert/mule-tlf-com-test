# mule-tlf-com-test

Interface RAML de laboratório consumindo o **release-flow-guardian-core** global.

Core global:

```text
https://github.com/LeonelIntegrationXpert/release-flow-guardian-core
```

## Estrutura local

Este repositório mantém apenas o que é específico da interface:

```text
api.raml
examples/
types/
traits/
securitySchemes/
resourceTypes/
release/guardian.config.yml
release/release-manifest.yml
release/api-contract-baseline.json
release/breaking-changes.yml
```

A inteligência fica no core global.

## Teste local

```bash
npm install --package-lock=false --no-audit --no-fund
npm run validate
npm run guardian:preflight
npm run config:ui
```

Abra:

```text
http://127.0.0.1:3030
```

## Teste com core local lado a lado

Se você tiver a pasta `global/release-flow-guardian-core` ao lado da pasta `Interfaces/mule-tlf-com-test`:

```bash
npm run guardian:install:local
npm run validate
npm run guardian:preflight
```

## GitHub Actions

O workflow deste repositório chama o workflow reutilizável do core:

```yaml
uses: LeonelIntegrationXpert/release-flow-guardian-core/.github/workflows/raml-ci-exchange.yml@main
```

## Secrets necessários para publicar no Exchange

- `ANYPOINT_CONNECTED_APP_CLIENT_ID`
- `ANYPOINT_CONNECTED_APP_CLIENT_SECRET`
- `ANYPOINT_ORG`
- `ANYPOINT_HOST`
- `EXCHANGE_GROUP_ID`

## Regra de contrato

- Endpoint novo: OK.
- Endpoint mantido: OK.
- Endpoint removido sem aprovação: BLOCK.
- Endpoint removido aprovado em `release/breaking-changes.yml`: WARN.

O baseline oficial fica em:

```text
release/api-contract-baseline.json
```
