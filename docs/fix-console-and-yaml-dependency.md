# Fix Console Local + YAML Dependency

## Problema 1 — Console aberto via `file://`

O Guardian Console precisa de uma API local (`/api/config`, `/api/endpoints/current`, etc.).
Ao abrir `tools/config-console/public/index.html` direto pelo navegador, o browser usa `file://` e bloqueia `fetch` por CORS.

Use sempre:

```bash
npm install
npm run config:ui
```

Depois abra:

```text
http://127.0.0.1:3030
```

A tela agora também mostra aviso quando for aberta via `file://` e tenta chamar `http://127.0.0.1:3030`, mas o modo correto continua sendo via servidor local.

## Problema 2 — `Cannot find module 'yaml'`

O pacote `yaml` é obrigatório porque os scripts leem `release/guardian.config.yml` e `release/breaking-changes.yml`.

Correções aplicadas:

- `yaml` declarado em `package.json`.
- Workflows usam `npm install --package-lock=false --no-audit --no-fund` para evitar lockfile antigo/stale.
- `npm run deps:check` roda antes das validações.
- `package-lock.json` foi removido do pacote para evitar URLs de registry antigas.

