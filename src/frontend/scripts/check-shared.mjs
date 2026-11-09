import { existsSync, readFileSync } from 'node:fs';
import { exit } from 'node:process';

const REMOTES = ['mfe-produtos', 'mfe-carrinho', 'mfe-checkout', 'mfe-notificacoes'];
const OBRIGATORIOS = ['@angular/core', '@fiap/shared'];

const ler = (app) => {
  const arquivo = `dist/${app}/browser/remoteEntry.json`;
  if (!existsSync(arquivo)) {
    console.error(`[contrato] ${arquivo} não existe — rode "npm run build:all" antes.`);
    exit(1);
  }
  return JSON.parse(readFileSync(arquivo, 'utf8')).shared;
};

const host = ler('host');
const exigidos = host.filter((dep) => dep.singleton && dep.strictVersion);
const problemas = [];

for (const remote of REMOTES) {
  const compartilhados = new Map(ler(remote).map((dep) => [dep.packageName, dep.version]));
  for (const dep of exigidos) {
    const versao = compartilhados.get(dep.packageName);
    if (versao && versao !== dep.version) {
      problemas.push(`${remote}: ${dep.packageName} ${versao} ≠ host ${dep.version}`);
    }
  }
  for (const pacote of OBRIGATORIOS) {
    if (host.some((dep) => dep.packageName === pacote) && !compartilhados.has(pacote)) {
      problemas.push(`${remote}: não compartilha ${pacote} — vai carregar uma segunda cópia`);
    }
  }
}

if (problemas.length) {
  console.error('[contrato] QUEBRA de contrato de versões:');
  problemas.forEach((p) => console.error(`  ✖ ${p}`));
  exit(1);
}

console.log(`[contrato] OK — ${REMOTES.length} remotes alinhados com o host em ${exigidos.length} dependências singleton.`);
