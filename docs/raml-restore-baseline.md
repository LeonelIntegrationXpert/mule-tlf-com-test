# RAML Restore Baseline

Este projeto possui snapshot RAML aprovado em:

```text
release/baseline/api.raml
```

Esse arquivo permite que o Release Flow Guardian Core faça restore seguro de bloco de endpoint quando um endpoint inteiro for removido acidentalmente.

Regras:

- `release/api-contract-baseline.json` continua sendo a fonte estrutural do contrato.
- `release/baseline/api.raml` permite preview e restore de bloco RAML.
- O snapshot deve ser atualizado apenas quando a release estiver `stable` e o baseline update for aprovado.
- O restore sempre cria backup em `release/backups` e registra histórico em `release/history/contract-change-history.jsonl`.
```
