# Checklist Premium — PR e Publish

## Checklist de PR

- [ ] RAML válido.
- [ ] OpenAPI YAML/JSON gerado.
- [ ] OpenAPI validado.
- [ ] Nenhum endpoint perdido.
- [ ] Nenhum method HTTP perdido.
- [ ] Nenhum response 2xx removido.
- [ ] Nenhum arquivo crítico removido.
- [ ] Sem conflict markers.
- [ ] Sem secrets hardcoded.
- [ ] Breaking changes aprovados de forma específica, se houver.
- [ ] Baseline oficial não alterado no PR.
- [ ] Artifacts gerados.
- [ ] Final summary = PASS ou WARNING controlado.

## Checklist de publish Exchange

- [ ] Branch `main` ou `master`.
- [ ] Publish manual autorizado.
- [ ] Contract Guard = PASS.
- [ ] Sem BLOCKER.
- [ ] Credenciais do Anypoint presentes via variável segura.
- [ ] `assetId`, `groupId` e versão validados.
- [ ] Versão não publicada anteriormente ou auto bump aprovado.
- [ ] Approval/environment configurado no Azure DevOps.
- [ ] Lock exclusivo de publicação ativo.
- [ ] Artifact de evidência publicado.
- [ ] Verificação pós-publicação executada.
