#!/usr/bin/env bash
# Aula 03 - Hands on
# Quickstart: como subir backend e frontend do zero, em dois terminais.

# --- Backend ---

cd src/backend
npm install
npm run gen:keys         # gera par ES256 no primeiro run
npm run start:dev        # cria db.sqlite + migrations + seed + sobe em :3000

# --- Frontend (em outro terminal) ---

cd src/frontend
npm install
npm run start:local      # sobe host + 4 remotes em :4200..:4204

# --- Credenciais pre-seed (criadas pela SeedUsers) ---
#
#   admin:   admin@fiap.com   / admin123
#   cliente: cliente@fiap.com / cliente123
#
# Sao dados de desenvolvimento local, ja hardcoded em
# src/backend/src/migrations/1700000001000-SeedUsers.ts.
