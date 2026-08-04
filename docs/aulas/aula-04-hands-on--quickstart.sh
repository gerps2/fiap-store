#!/usr/bin/env bash
# Aula 04 - Hands on
# Quickstart da aula: clonar o repo, ir para a branch aula-04 e rodar a
# esteira do frontend (lint, teste com coverage e build de todos os MFEs).
#
# Fonte: Elaborado pelo autor (2026)

git clone https://github.com/gerps2/fiap-store.git
cd fiap-store
git checkout aula-04

# Quickstart do frontend (o foco desta aula):

cd src/frontend
npm install
npm run lint && npm run test:ci && npm run build:all
