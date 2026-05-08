/**
 * Gera o federation.manifest.json ativo com base no modo escolhido.
 *
 * Uso:
 *   node scripts/use-manifest.mjs local
 *   node scripts/use-manifest.mjs dev
 *   node scripts/use-manifest.mjs solo --mfe=mfe-notificacoes
 *
 * Lê os templates em src/frontend/projects/host/public/federation.manifest.{local,dev,solo}.json
 * e grava o resultado em src/frontend/projects/host/public/federation.manifest.json.
 *
 * Comportamento:
 *  - local : copia federation.manifest.local.json (todos em localhost).
 *  - dev   : copia federation.manifest.dev.json (todos em deploy preview).
 *  - solo  : parte do federation.manifest.dev.json e SUBSTITUI a entrada do --mfe= passado
 *            pela URL local correspondente (lida do federation.manifest.local.json).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', 'src', 'frontend', 'projects', 'host', 'public');

const mode = argv[2];
if (!['local', 'dev', 'solo'].includes(mode)) {
  console.error('[manifest] modo inválido. Use: local | dev | solo');
  process.exit(1);
}

const mfeArg = argv.find((a) => a.startsWith('--mfe='));
const mfe = mfeArg?.split('=')[1];

const local = JSON.parse(readFileSync(`${ROOT}/federation.manifest.local.json`, 'utf8'));
const dev = JSON.parse(readFileSync(`${ROOT}/federation.manifest.dev.json`, 'utf8'));

let manifest;

if (mode === 'local') {
  manifest = local;
} else if (mode === 'dev') {
  manifest = dev;
} else {
  if (!mfe) {
    console.error('[manifest] modo solo exige --mfe=<nome>. Ex: --mfe=mfe-notificacoes');
    process.exit(1);
  }
  if (!local[mfe]) {
    console.error(`[manifest] MFE "${mfe}" não existe no federation.manifest.local.json`);
    process.exit(1);
  }
  manifest = { ...dev, [mfe]: local[mfe] };
}

writeFileSync(`${ROOT}/federation.manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`[manifest] modo=${mode}${mfe ? ` mfe=${mfe}` : ''} -> ${ROOT}/federation.manifest.json`);
