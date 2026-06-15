# Release Flow Guardian Console

Execute localmente:

```bash
npm install
npm run config:ui
```

Acesse:

```text
http://127.0.0.1:3030
```

A tela edita principalmente:

```text
release/guardian.config.yml
release/breaking-changes.yml
```

A tela não deve receber secrets reais. Ela mostra somente os nomes esperados para GitHub Actions/Azure DevOps.

## Fluxo seguro de salvamento

1. Alterar campos
2. Validar
3. Salvar
4. Backup automático em `release/backups/`

## Endpoint Inventory

A tela compara:

- RAML atual
- baseline oficial `release/api-contract-baseline.json`

Se endpoint/método/param sumir sem aprovação, a decisão vira `BLOCK`.

## Removal Approval

Aprovar remoção atualiza `release/breaking-changes.yml`.

Aprovar remoção não altera o RAML. Apenas declara que a remoção detectada é intencional.
