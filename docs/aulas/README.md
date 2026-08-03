# Aulas

Codigo das aulas, guardado como arquivo executavel (sem subpasta por aula).

## Convencao de nome

```
aula-<NN>-<slug-da-aula>--<nome-do-arquivo>.<ext>
```

O `--` separa o prefixo da aula do nome real do arquivo, entao o nome original
continua legivel mesmo quando ja tem hifen. O slug e o nome da aula em
minusculas, sem acento, com hifen no lugar de espaco.

## Indice

| Aula | Tema | Arquivos |
| --- | --- | --- |
| 02 | Hands on | [`aula-02-hands-on--parte-1.sh`](aula-02-hands-on--parte-1.sh) — scaffold do MFE `mfe-notificacoes` (porta 4204), lib `shared-ui` e comandos para subir o ambiente<br>[`aula-02-hands-on--mfe-produtos-federation.config.js`](aula-02-hands-on--mfe-produtos-federation.config.js) — secao "saiba mais": config de native-federation do `mfe-produtos`<br>[`aula-02-hands-on--ui-remote-outlet.component.ts`](aula-02-hands-on--ui-remote-outlet.component.ts) — wrapper que carrega componente remoto com retry exponencial e fallback de erro |
| 03 | Hands on | [`aula-03-hands-on--quickstart.sh`](aula-03-hands-on--quickstart.sh) — quickstart do backend e do frontend, e credenciais pre-seed<br>[`aula-03-hands-on--apollo-error-link.ts`](aula-03-hands-on--apollo-error-link.ts) — secao "saiba mais": link de erro do Apollo com code e traceId<br>[`aula-03-hands-on--provide-store-apollo.ts`](aula-03-hands-on--provide-store-apollo.ts) — secao "saiba mais": provider do Apollo com link de CSRF |
