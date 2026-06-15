# Endpoint Governance

Regra default:

```text
Endpoint removido sem aprovação = BLOCK
Endpoint removido com aprovação = WARN
Endpoint novo = OK
Endpoint existente = OK
```

Aprovação deve conter:

- ticket
- approvedBy
- reason
- method
- path

Use a tela local para aprovar remoções detectadas:

```bash
npm run config:ui
```
