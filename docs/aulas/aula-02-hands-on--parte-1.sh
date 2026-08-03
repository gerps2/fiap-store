#!/usr/bin/env bash
# Aula 02 - Hands on (parte 1)
# Scaffold do MFE de notificacoes, lib compartilhada e formas de subir o ambiente.

# Novo remote (porta 4204)

ng generate application mfe-notificacoes --routing --skip-tests

ng add @angular-architects/native-federation --project mfe-notificacoes --port 4204 --type remote

# Lib compartilhada

ng generate library shared-ui

npm run build:shared-ui

# Sobe tudo (modo local)

npm start

# Sobe so o meu MFE, o resto vem do deploy preview

npm run start:solo --mfe=mfe-notificacoes --port=4204
