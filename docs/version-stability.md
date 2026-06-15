# Version Stability

O Guardian separa versão técnica e estabilidade.

Exemplo:

```text
Versão: 1.0.3
Stability: stable
```

Regras padrão:

```text
feature/*       -> draft
develop         -> beta
release/next    -> beta
release/current -> rc
main/master     -> stable
```

Apenas `stable` deve atualizar o baseline oficial.
