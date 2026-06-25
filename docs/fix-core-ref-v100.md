# Correção do Guardian Core Ref

## Problema

Ao abrir o Guardian Console, ocorreu o erro:

```text
fatal: Remote branch v1.0.0 not found in upstream origin
```

Isso acontece quando o launcher local tenta baixar o `release-flow-guardian-core` usando uma referência que ainda não existe no repositório remoto.

## Ajuste aplicado

O launcher local `tools/guardian.cmd` foi ajustado para usar `main` como referência padrão:

```bat
if not defined RFG_CORE_REF set "RFG_CORE_REF=main"
```

Assim, o console local volta a abrir normalmente sem depender de uma tag inexistente.

## Como usar uma tag no futuro

Quando uma tag real existir no repositório do core, é possível apontar manualmente antes de executar:

```bat
set RFG_CORE_REF=v1.0.0
tools\guardian.cmd
```

Mas essa tag precisa existir no repositório remoto. Caso contrário, o Git não conseguirá baixar o core.

## Comando recomendado agora

```bat
tools\guardian.cmd
```
