# Branch Strategy — mule-tlf-com-test

Este projeto foi criado para laboratório do Release Flow Guardian no Design Center.

## Fluxo sugerido

```text
feature/rlm202606-release-status
        ↓
release/next
        ↓
release/current
        ↓
master
```

## Objetivo do teste

Validar se o processo consegue detectar alterações de contrato RAML, comparar versões entre branches e gerar evidência antes da promoção.

## Regras iniciais

- `feature/*` recebe desenvolvimento isolado.
- `release/next` representa a próxima release em montagem.
- `release/current` representa a release corrente em validação/homologação.
- `master` representa produção.
- Nenhum ambiente deve ser tratado como branch.
- Upload/write no Design Center deve começar em modo dry-run.
