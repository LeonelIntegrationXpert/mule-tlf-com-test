# Release Flow Guardian — API Contract Guard + HTML Report

Este projeto agora possui duas proteções adicionais antes de publicar no Exchange:

1. **API Contract Guard** — detecta perda acidental de endpoint/contrato.
2. **HTML Report** — gera um painel visual dark/neon com o resultado da validação, contrato e publicação.

## Por que isso existe?

Publicar uma versão nova no Exchange é fácil.
O risco real é publicar sem perceber que um endpoint, método, parâmetro, response ou schema foi removido.

O Contract Guard compara o RAML atual contra uma referência anterior e bloqueia breaking changes não aprovadas.

## O que bloqueia automaticamente

- Endpoint removido
- Método HTTP removido
- URI param removido ou com tipo alterado
- Query param obrigatório removido ou com tipo alterado
- Response `200` ou `201` removida
- Request body removido ou com tipo alterado
- Type/schema removido
- Campo obrigatório removido
- Tipo de campo alterado
- Security scheme removido
- Trait removida

## E se a remoção for intencional?

Use o arquivo:

```text
release/breaking-changes.yml
```

Exemplo:

```yaml
breakingChanges:
  approved: true
  ticket: "RLM202606-123"
  approvedBy: "leonel.d.porto@accenture.com"
  reason: "Endpoint removido porque foi substituído por /release/v2/status/{releaseId}."
  removedEndpoints:
    - method: GET
      path: /release/v1/status/{releaseId}
  approvedRules: []
```

Sem `ticket`, `approvedBy` e `reason`, a aprovação não é considerada válida.

## Baseline

O comparador tenta usar, nesta ordem:

1. RAML da branch alvo do Pull Request, via `git show origin/<base>:api.raml`.
2. RAML do commit anterior, via `git show HEAD^:api.raml`.
3. Baseline estático em `release/api-contract-baseline.json`.

O baseline estático é útil no primeiro laboratório ou quando não existe histórico Git suficiente.

## Comandos locais

```bash
npm install
npm run validate:release
npm run validate:raml
npm run contract:guard
npm run package:exchange
npm run report:html
```

Ou tudo de validação:

```bash
npm run ci:validate
```

## Arquivos gerados

```text
dist/api-contract-current.json
dist/api-contract-baseline-used.json
dist/api-contract-diff.json
dist/api-contract-diff.md
dist/release-flow-guardian-report.html
dist/release-flow-guardian-report.json
```

## Histórico dos reports

Não recomendamos commitar os reports gerados na `main`.

Modelo recomendado:

- GitHub Actions Artifacts: guarda HTML/JSON/ZIP por execução.
- GitHub Step Summary: resumo direto na Action.
- Branch separada `release-reports` ou GitHub Pages: opcional para histórico consultável.

Regra:

```text
Código fonte fica na main.
Evidência de execução fica como artifact.
Histórico consultável fica fora da branch principal.
```
