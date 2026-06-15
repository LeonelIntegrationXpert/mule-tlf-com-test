# Exchange Publish Auto Bump Strategy

Este projeto usa o **Release Flow Guardian** para publicar RAML no Anypoint Exchange com versionamento automático e proteção contra erro `409 Conflict`.

## Regra de versionamento

- Asset ID: `mule-tlf-com-test`
- Minor line: `1.0`
- Primeira versão: `1.0.0`
- Próximas versões: `1.0.1`, `1.0.2`, `1.0.3`...

## Fluxo

1. Validar RAML.
2. Validar `release/release-manifest.yml`.
3. Gerar ZIP do Exchange.
4. Validar se o ZIP contém `api.raml`.
5. Autenticar na Anypoint com Connected App.
6. Consultar Exchange.
7. Resolver próxima versão.
8. Publicar.
9. Se der `409`, reconsultar e fazer auto bump até 3 vezes.
10. Se der `400`, bloquear com diagnóstico, exceto se a mensagem indicar versão duplicada.
11. Se der `401/403`, bloquear por credencial/permissão.
12. Se der `429/5xx`, retry com backoff.
13. Verificar se a versão apareceu no Exchange.
14. Gerar relatório final.

## Tratamento de erros

| Erro | Ação |
|---|---|
| `400` | Bloqueia com diagnóstico. Não faz bump no escuro. |
| `401` | Bloqueia: client id/secret inválido. |
| `403` | Bloqueia: Connected App sem permissão. |
| `404` no preflight | Trata como asset novo e usa `1.0.0`. |
| `404` no publish | Bloqueia: org/group/endpoint incorreto. |
| `409` | Reconsulta Exchange, calcula latest + 1 e tenta novamente até 3 vezes. |
| `412` | Reconsulta uma vez; se persistir, bloqueia. |
| `429` | Retry com backoff. |
| `500/502/503/504` | Retry com backoff e valida se a versão apareceu. |
| timeout/network | Consulta Exchange antes de tentar novamente. |

## GitHub Actions

O workflow possui `concurrency` para evitar duas publicações simultâneas no mesmo asset/minor line.

```yaml
concurrency:
  group: exchange-publish-${{ github.repository }}-mule-tlf-com-test-1-0
  cancel-in-progress: false
```

## Relatórios

Após a execução, os relatórios ficam em:

```text
dist/exchange-publish-report.md
dist/exchange-publish-report.json
```

## Variáveis obrigatórias

GitHub Secrets ou Azure Variables:

```text
ANYPOINT_CONNECTED_APP_CLIENT_ID
ANYPOINT_CONNECTED_APP_CLIENT_SECRET
ANYPOINT_ORG
ANYPOINT_HOST
EXCHANGE_GROUP_ID
```

Para Anypoint global:

```text
ANYPOINT_HOST=anypoint.mulesoft.com
```
