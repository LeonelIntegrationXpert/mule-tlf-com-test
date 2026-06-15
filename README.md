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
