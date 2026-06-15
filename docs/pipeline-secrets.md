# Pipeline Secrets — mule-tlf-com-test

## GitHub Actions — Repository Secrets

Crie em:

`Repository > Settings > Secrets and variables > Actions > New repository secret`

Obrigatórios para publicar no Exchange:

| Secret | Obrigatório | Exemplo / Observação |
|---|---:|---|
| `ANYPOINT_CONNECTED_APP_CLIENT_ID` | Sim | Client ID da Connected App |
| `ANYPOINT_CONNECTED_APP_CLIENT_SECRET` | Sim | Client Secret da Connected App |
| `ANYPOINT_ORG` | Sim | Organization/Business Group ID da Anypoint |
| `ANYPOINT_ENV` | Sim | Ambiente usado pela CLI. Ex: `Design`, `Sandbox`, `B2B-DEV-FENIX` |
| `ANYPOINT_HOST` | Sim | Normalmente `anypoint.mulesoft.com` |
| `EXCHANGE_GROUP_ID` | Recomendado | Geralmente igual ao `ANYPOINT_ORG` |

Opcionais:

| Secret | Uso |
|---|---|
| `MULE_NEXUS_USERNAME` | Apenas se usar Maven/Nexus no futuro |
| `MULE_NEXUS_PASSWORD` | Apenas se usar Maven/Nexus no futuro |

## Azure DevOps — Pipeline Variables / Variable Group

Crie as mesmas variáveis no Azure DevOps, preferencialmente em um Variable Group marcado como secreto:

- `ANYPOINT_CONNECTED_APP_CLIENT_ID`
- `ANYPOINT_CONNECTED_APP_CLIENT_SECRET`
- `ANYPOINT_ORG`
- `ANYPOINT_ENV`
- `ANYPOINT_HOST`
- `EXCHANGE_GROUP_ID`

## Scopes mínimos da Connected App

Para publicar no Exchange, a Connected App precisa atuar no próprio nome via `client_credentials` e ter acesso de escrita no Exchange, como `Exchange Contributor` ou `Exchange Administrator` no Business Group correto.

Para autenticação básica da Maven Facade do Exchange, quando usada, o padrão é:

- username: `~~~Client~~~`
- password: `client_id~?~client_secret`
