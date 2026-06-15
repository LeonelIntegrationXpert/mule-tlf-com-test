# Exchange JSON no Release Flow Guardian

Este projeto **não** deve empacotar `exchange.json` dentro do `raml.zip` quando a publicação usa auto bump de versão.

Motivo: o Anypoint Exchange valida o `exchange.json` contido no pacote contra os metadados passados no publish. Como a versão final é resolvida dinamicamente pelo Guardian (`1.0.x + 1`), um `exchange.json` com placeholders como `${EXCHANGE_GROUP_ID}` ou `${EXCHANGE_ASSET_VERSION_AUTO_RESOLVED}` causa erro 400 de mismatch.

A publicação correta é controlada por:

- `release/guardian.config.yml`
- variáveis de ambiente/secrets
- `npx release-flow-guardian package:exchange`
- `npx release-flow-guardian publish:exchange`

O pacote RAML gerado deve conter `api.raml` e recursos RAML, mas não deve conter `exchange.json` raiz.
