# mule-tlf-com-test

Projeto RAML de laboratório para testar o fluxo do **Release Flow Guardian** no Design Center.

## API

**Nome:** mule-tlf-com-test  
**Versão:** v1  
**Endpoint:** `GET /release/v1/status/{releaseId}`

## Estrutura

```text
api.raml
├─ types/
├─ examples/
├─ traits/
├─ securitySchemes/
├─ release/
└─ docs/
```

## Endpoint de teste

```http
GET /release/v1/status/RLM202606?environment=DEV&dryRun=true
client_id: 8f4c1d2e-guardian-client
client_secret: 7e2c9f4a9b1d
x-correlation-id: 8b4d4f92-3f77-4d2a-9a19-5fd0b6f9c001
x-client-name: release-flow-guardian-lab
x-channel: PIPELINE
```

## Objetivo

Este projeto permite testar:

- criação de projeto no Design Center;
- alteração controlada em RAML;
- comparação entre branches;
- validação de contrato;
- geração de evidência;
- simulação de branch strategy: `feature/* → release/next → release/current → master`.

## Importação no Design Center

1. Criar um novo projeto no Design Center.
2. Usar a opção de importar arquivo ZIP.
3. Selecionar este pacote.
4. Abrir `api.raml` como arquivo principal.
5. Criar branches de teste conforme `docs/branch-strategy.md`.

---

## CI/CD pronto no pacote

Este pacote já vem preparado para GitHub Actions e Azure DevOps.

### GitHub Actions

Workflow:

```text
.github/workflows/raml-ci-exchange.yml
```

Comportamento:

```text
Pull Request -> valida RAML + release manifest + gera artifact
Push main/master -> valida RAML + gera pacote + publica no Exchange
Manual dispatch -> permite publicar no Exchange com versão informada
```

### Azure DevOps

Pipelines:

```text
.azuredevops/azure-pipeline-raml-ci.yml
.azuredevops/azure-pipeline-exchange-publish.yml
```

### Comandos locais

```bash
npm install
npm run validate
npm run package:exchange
```

Para publicar localmente, exporte as variáveis necessárias e rode:

```bash
npm run publish:exchange
```

Veja também:

```text
docs/pipeline-secrets.md
docs/git-flow-ci-cd.md
```


## Exchange Publish com Auto Bump

Este projeto está preparado para publicar no Anypoint Exchange com versão automática na linha `1.0.x`.

Regra:

```text
Se o asset não existir:
  publica 1.0.0

Se o asset existir:
  busca a última versão 1.0.x
  publica 1.0.(último patch + 1)
```

Proteções:

```text
409 Conflict:
  auto bump até 3 vezes

400 Bad Request:
  falha com diagnóstico claro
  não faz bump automático no escuro

401/403:
  falha por credencial/permissão

429/5xx:
  retry com backoff
```

Relatórios gerados:

```text
dist/exchange-publish-report.md
dist/exchange-publish-report.json
```

Documentação completa:

```text
docs/exchange-autobump-strategy.md
```


## API Contract Guard + HTML Report

Este projeto agora possui proteção contra perda acidental de contrato antes da publicação no Exchange.

O Contract Guard compara o RAML atual contra uma referência anterior e bloqueia breaking changes não aprovadas, como:

```text
endpoint removido
método HTTP removido
query param obrigatório removido
response 200/201 removida
security scheme removido
trait removida
type/schema removido
campo obrigatório removido
campo com tipo alterado
```

Também gera um report visual dark/neon em:

```text
dist/release-flow-guardian-report.html
dist/release-flow-guardian-report.json
```

Comandos:

```bash
npm run contract:guard
npm run report:html
npm run ci:validate
```

Para aprovar uma quebra intencional, use:

```text
release/breaking-changes.yml
```

Documentação completa:

```text
docs/contract-guard-and-html-report.md
```


---

## Release Flow Guardian Console

Este projeto agora possui uma tela local para configuração e governança de contrato.

```bash
npm install
npm run config:ui
```

Acesse:

```text
http://127.0.0.1:3030
```

A tela permite:

- editar `release/guardian.config.yml`
- visualizar endpoints atuais do RAML
- comparar endpoints com o baseline oficial
- detectar endpoints removidos
- aprovar remoções intencionais em `release/breaking-changes.yml`
- gerar backups antes de salvar

## Correção do erro `Cannot find module 'yaml'`

O projeto depende explicitamente de `yaml` em `package.json`.

A pipeline agora executa:

```bash
npm install --no-audit --no-fund
npm run deps:check
```

Isso valida logo no início se `yaml` e `raml-1-parser` foram instalados corretamente, evitando falha tardia em `scripts/check-release-manifest.js`.

## Comandos principais

```bash
npm install
npm run deps:check
npm run validate:config
npm run validate
npm run contract:extract
npm run contract:guard
npm run package:exchange
npm run report:html
npm run config:ui
```

## Regra de perda de endpoint

Default seguro:

```text
Endpoint removido sem aprovação = BLOCK
Endpoint removido com aprovação = WARN
```

Aprovação deve ser feita via `release/breaking-changes.yml` ou pela tela local.

## Secrets obrigatórios

```text
ANYPOINT_CONNECTED_APP_CLIENT_ID
ANYPOINT_CONNECTED_APP_CLIENT_SECRET
ANYPOINT_ORG
ANYPOINT_HOST
EXCHANGE_GROUP_ID
```
