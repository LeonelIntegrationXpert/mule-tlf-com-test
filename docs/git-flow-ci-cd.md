# Git Flow CI/CD — mule-tlf-com-test

## Fluxo recomendado

```text
feature/*
  ↓ Pull Request
release/next
  ↓ Pull Request
release/current
  ↓ Pull Request / aprovação
main ou master
  ↓ CI + publicação Exchange
```

## Regras

- Pull Request valida RAML e Manifest, mas não publica no Exchange.
- Push em `main` ou `master` valida e publica no Exchange.
- `workflow_dispatch` permite publicação manual controlada.
- O pacote publicado no Exchange é gerado em `dist/mule-tlf-com-test-exchange.zip`.

## Gates iniciais

- `api.raml` existe e compila.
- `release/release-manifest.yml` existe.
- `release.id` segue `RLMYYYYMM`.
- `release.application` deve ser `mule-tlf-com-test`.
- Evidências obrigatórias no manifest devem estar marcadas como `true`.
