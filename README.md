# mule-tlf-com-test

Projeto RAML/Design Center usado como laboratório do Release Flow Guardian.

Agora este repositório está no modelo **core consumer**:

- Este repo guarda o contrato da API e configurações locais.
- O motor global fica no repo `release-flow-guardian-core`.

## Arquivos locais importantes

```text
api.raml
release/guardian.config.yml
release/release-manifest.yml
release/api-contract-baseline.json
release/breaking-changes.yml
```

## Primeiro uso local

Extraia este projeto e o `release-flow-guardian-core` lado a lado:

```text
Release Flow Guardian/
├─ release-flow-guardian-core/
└─ mule-tlf-com-test/
```

Depois rode:

```bash
npm run guardian:install:local
npm run validate
npm run guardian:preflight
npm run config:ui
```

Abra:

```text
http://127.0.0.1:3030
```

## Depois que o core estiver no GitHub

```bash
npm run guardian:install:git
npm run validate
```

## GitHub Actions

O workflow local chama o reusable workflow global:

```text
.github/workflows/release-flow-guardian.yml
```

Secrets necessários:

```text
ANYPOINT_CONNECTED_APP_CLIENT_ID
ANYPOINT_CONNECTED_APP_CLIENT_SECRET
ANYPOINT_ORG
ANYPOINT_HOST
EXCHANGE_GROUP_ID
```

## Regra de contrato

Endpoint removido sem aprovação em `release/breaking-changes.yml` bloqueia a pipeline.
Endpoint removido com aprovação passa como WARN.


## Observação importante sobre Exchange

Este projeto consome o `release-flow-guardian-core` global. O pacote `raml.zip` gerado para o Exchange não deve incluir `exchange.json` raiz com placeholders.

A configuração de publicação fica em:

```text
release/guardian.config.yml
```

A versão é resolvida automaticamente no publish pelo Guardian Core.
