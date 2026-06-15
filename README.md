# mule-tlf-com-test

Projeto RAML de laboratório para testar o fluxo do **Release Flow Guardian** no Design Center.

## API

**Nome:** mule-tlf-com-test  
**Versão:** v1  
**Endpoint:** `GET /release/v1/status/{releaseId}`

## Estrutura

```text
api.raml
├─ types/
├─ examples/
├─ traits/
├─ securitySchemes/
├─ release/
└─ docs/
```

## Endpoint de teste

```http
GET /release/v1/status/RLM202606?environment=DEV&dryRun=true
client_id: 8f4c1d2e-guardian-client
client_secret: 7e2c9f4a9b1d
x-correlation-id: 8b4d4f92-3f77-4d2a-9a19-5fd0b6f9c001
x-client-name: release-flow-guardian-lab
x-channel: PIPELINE
```

## Objetivo

Este projeto permite testar:

- criação de projeto no Design Center;
- alteração controlada em RAML;
- comparação entre branches;
- validação de contrato;
- geração de evidência;
- simulação de branch strategy: `feature/* → release/next → release/current → master`.

## Importação no Design Center

1. Criar um novo projeto no Design Center.
2. Usar a opção de importar arquivo ZIP.
3. Selecionar este pacote.
4. Abrir `api.raml` como arquivo principal.
5. Criar branches de teste conforme `docs/branch-strategy.md`.
