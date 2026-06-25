# Premium Pipeline Governance — RAML, OpenAPI, Anti Código Perdido e Exchange

## Objetivo

Esta versão premium fortalece a esteira do projeto para evitar perda de contrato RAML, divergência entre RAML e OpenAPI, publicação indevida no Exchange e aprovação fraca de breaking changes.

## Principais melhorias

- Pipeline Azure DevOps self-contained, sem dependência direta de template remoto em `main`.
- `pr:` explícito para validar Pull Requests.
- `ubuntu-22.04` fixo.
- Node.js 20 fixo.
- Checkout com histórico completo (`fetchDepth: 0`).
- Guards de estrutura, conflict markers, secrets e arquivos protegidos.
- Evidência de `git diff` como artifact.
- Extração de contrato RAML para JSON normalizado.
- Conversão RAML -> OpenAPI 3.0.3 em YAML e JSON.
- Comparação RAML x OpenAPI para impedir perda de paths/methods/responses.
- Contract diff contra baseline oficial.
- Final summary que respeita `BLOCKED` do Contract Guard.
- Publish Exchange separado, manual/controlado e somente em `main/master`.

## Regra principal

Se qualquer validação de contrato retornar `BLOCKED`, a entrega final fica `BLOCKED` e o publish no Exchange deve ser proibido.

## Arquivos principais adicionados

```text
tools/guards/*
tools/git/git-diff-report.sh
tools/contract/*
tools/openapi/*
tools/exchange/*
tools/reports/final-summary.js
.azuredevops/azure-pipeline-raml-ci.yml
.azuredevops/azure-pipeline-exchange-publish.yml
```

## Artifacts gerados

```text
dist/openapi/openapi.yaml
dist/openapi/openapi.json
dist/reports/final-summary.md
dist/reports/contract-diff.md
dist/reports/raml-to-openapi-report.md
dist/reports/raml-to-openapi-diff.md
dist/reports/openapi-lint-report.md
dist/reports/protected-files-report.md
dist/reports/git-diff-name-status.txt
dist/reports/git-diff-stat.txt
dist/reports/security-scan-report.md
```

## Observação sobre RAML -> OpenAPI

A conversão local implementada é conservadora e sem dependências externas. Para ambientes corporativos com RAML avançado, recomenda-se validar também com AMF/Spectral/Redocly homologado.
