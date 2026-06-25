# Fix Notes

## 2026-06-15

Correções aplicadas no pacote CI/CD:

- Corrigida dependência `raml-1-parser` de `1.1.68` para `1.1.67`, pois a versão `1.1.68` não existe no pacote oficial `raml-1-parser` no npm.
- Removida exigência de `ANYPOINT_ENV` no publish do Exchange, porque RAML/Design Center/Exchange não publicam por ambiente.
- Corrigida montagem dos JSONs `--properties` e `--files` no script `scripts/publish-exchange.sh`.
- GitHub Actions e Azure DevOps ajustados para usar apenas `ANYPOINT_CONNECTED_APP_CLIENT_ID`, `ANYPOINT_CONNECTED_APP_CLIENT_SECRET`, `ANYPOINT_ORG`, `ANYPOINT_HOST` e `EXCHANGE_GROUP_ID`.

## Correção — Guardian Core Ref local

- Ajustado `tools/guardian.cmd` para usar `RFG_CORE_REF=main` por padrão.
- Evita falha ao baixar o core quando a tag `v1.0.0` ainda não existe no repositório remoto.
- Mantida possibilidade de sobrescrever manualmente com `set RFG_CORE_REF=<tag-ou-branch-existente>`.
- Adicionado documento `docs/fix-core-ref-v100.md`.
