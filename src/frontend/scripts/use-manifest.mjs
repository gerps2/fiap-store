import { readFileSync, writeFileSync } from 'node:fs';
import { argv, env, exit } from 'node:process';

const DIR = 'projects/host/public';
const modo = argv[2];
const mfe = argv.find((a) => a.startsWith('--mfe='))?.split('=')[1] ?? env.npm_config_mfe;
const porta = argv.find((a) => a.startsWith('--port='))?.split('=')[1] ?? env.npm_config_port;

const ler = (nome) => JSON.parse(readFileSync(`${DIR}/federation.manifest.${nome}.json`, 'utf8'));

if (!['local', 'dev', 'solo'].includes(modo)) {
  console.error('Uso: node scripts/use-manifest.mjs <local|dev|solo> [--mfe=<nome>] [--port=<porta>]');
  exit(1);
}

let manifest = ler(modo === 'solo' ? 'dev' : modo);

if (modo === 'solo') {
  const local = ler('local');
  if (!mfe || !local[mfe]) {
    console.error(`[manifest] modo solo exige --mfe=<nome>. Disponíveis: ${Object.keys(local).join(', ')}`);
    exit(1);
  }
  manifest = { ...manifest, [mfe]: porta ? `http://localhost:${porta}/remoteEntry.json` : local[mfe] };
}

writeFileSync(`${DIR}/federation.manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(`[manifest] modo=${modo}${mfe && modo === 'solo' ? ` mfe=${mfe}` : ''}`);
console.table(manifest);
