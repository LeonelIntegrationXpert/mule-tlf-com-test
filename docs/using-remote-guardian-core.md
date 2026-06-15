# Usando o Release Flow Guardian Core remoto

Este projeto não carrega o motor do Guardian. Ele possui apenas o contrato RAML, arquivos de configuração em `release/` e um launcher em `tools/guardian.cmd`.

## Abrir o menu local

```bat
tools\guardian.cmd
```

O launcher faz:

1. Descobre a pasta do projeto.
2. Baixa/atualiza `release-flow-guardian-core` do GitHub.
3. Instala dependências fora do projeto, em cache local.
4. Executa o core com `--project` apontando para este projeto.
5. Abre o console em `http://127.0.0.1:3030`.

## Cache local

Por padrão:

```text
%LOCALAPPDATA%\ReleaseFlowGuardian\core\main
```

Use a opção `Limpar cache do core` se quiser forçar baixar tudo de novo.

## Usar tag em vez de main

Antes de rodar o CMD, você pode definir:

```bat
set RFG_CORE_REF=v1.0.0
tools\guardian.cmd
```

Durante desenvolvimento, `main` é mais rápido. Em produção, use tags.

## Regra de contrato

- Endpoint novo: OK
- Endpoint mantido: OK
- Endpoint removido sem aprovação: BLOCK
- Endpoint removido aprovado em `release/breaking-changes.yml`: WARN

O arquivo `tools/guardian.cmd` não deve conter crases Markdown nem links Markdown.
