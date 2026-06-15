# mule-tlf-com-test

Projeto RAML consumidor do **Release Flow Guardian Core**.

Este repositório mantém apenas o contrato da API e os arquivos de configuração/evidência. O motor do Guardian fica no repositório global:

```text
https://github.com/LeonelIntegrationXpert/release-flow-guardian-core
```

## Estrutura

```text
api.raml
release/guardian.config.yml
release/api-contract-baseline.json
release/breaking-changes.yml
release/release-manifest.yml
tools/guardian.cmd
.github/workflows/release-flow-guardian.yml
```

## Rodar local no Windows

```bat
tools\guardian.cmd
```

Opções principais:

```text
[1] Baixar/atualizar core
[2] Validar projeto
[3] Rodar preflight completo
[4] Abrir console local
[5] Gerar report HTML
[6] Limpar cache do core
```

O console abre em:

```text
http://127.0.0.1:3030
```

## Como funciona

O launcher baixa o core em cache local, instala dependências fora deste projeto e executa:

```bat
node "%CORE_CACHE_DIR%\bin\guardian.js" validate --project "%PROJECT_DIR%"
```

Assim, este projeto não precisa carregar scripts pesados, console duplicado ou `node_modules` para usar o Guardian.

## GitHub Actions

A pipeline usa o workflow reutilizável do core:

```yaml
uses: LeonelIntegrationXpert/release-flow-guardian-core/.github/workflows/raml-ci-exchange.yml@main
```

## Contract Guard

- Stable Baseline Guard é obrigatório.
- Git Diff Guard é complementar.
- Endpoint removido sem aprovação bloqueia.
- Endpoint removido aprovado passa com warning.
- Se `finalDecision = BLOCK`, não publica no Exchange.
