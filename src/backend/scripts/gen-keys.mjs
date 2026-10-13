#!/usr/bin/env node
/**
 * Gera um par ES256 (ECDSA P-256) e grava em .keys/.
 * Usado pelo módulo auth para assinar/verificar JWTs.
 *
 * Uso: npm run gen:keys
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateKeyPairSync } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYS_DIR = resolve(__dirname, '..', '.keys');
const PRIV = resolve(KEYS_DIR, 'es256-private.pem');
const PUB = resolve(KEYS_DIR, 'es256-public.pem');

if (existsSync(PRIV)) {
  console.log('[gen-keys] .keys/es256-private.pem já existe — nada a fazer.');
  console.log('[gen-keys] Delete .keys/ manualmente para gerar um par novo.');
  process.exit(0);
}

mkdirSync(KEYS_DIR, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileSync(PRIV, privateKey, { mode: 0o600 });
writeFileSync(PUB, publicKey, { mode: 0o644 });

console.log('[gen-keys] par ES256 gerado:');
console.log(`  ${PRIV}`);
console.log(`  ${PUB}`);
console.log('[gen-keys] lembre-se: .keys/ está no .gitignore — nunca commite chaves.');
