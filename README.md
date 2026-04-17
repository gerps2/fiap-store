# fiap-mf-aula2

Código de referência da **Aula 2** da disciplina *Arquitetura Angular para Aplicações de Alta Escala* (FIAP PosTech).

Continuação direta do `fiap-mf-aula1`. A base é a mesma (1 host + 3 remotes em Angular 21 com `@angular-architects/native-federation`); a Aula 2 adiciona, em três passos hands-on:

1. **Vídeo 2** — novo MFE `mfe-notificacoes` (4204), exposto em duas formas (`./Sino` componente único e `./Pagina` página inteira com sub-rotas).
2. **Vídeo 3** — lib `shared-ui` (`UiButtonComponent` + tokens CSS) compartilhada via `share` em todos os MFEs.
3. **Vídeo 4** — `singleton`/`strictVersion`/`requiredVersion`, simulação de quebra por upgrade isolado, e setup local **modo `solo`** (manifest por ambiente + scripts npm: aluno sobe só o remote dele).

## Apps após a Aula 2

| App | Porta | Tipo | O que expõe |
|---|---|---|---|
| `host` | 4200 | `dynamic-host` | Topbar com sino do `mfe-notificacoes` + rotas + composição da home |
| `mfe-produtos` | 4201 | `remote` | `./Component` → `ProdutosComponent` (consome `<ui-button>` e tokens) |
| `mfe-carrinho` | 4202 | `remote` | `./Component` → `CarrinhoComponent` (alvo do cenário "upgrade quebra prod") |
| `mfe-checkout` | 4203 | `remote` | `./Component` → `CheckoutComponent` (botão "Finalizar" usa `<ui-button>`) |
| `mfe-notificacoes` | 4204 | `remote` | `./Sino` → `SinoNotificacoesComponent` · `./Pagina` → `NotificacoesPageComponent` (sub-rotas `lista`/`configuracoes`) |
| `shared-ui` (lib) | — | library | `UiButtonComponent` + `tokens.css` (cores, tipografia, espaçamentos) |

## Pré-requisitos

- Node.js 24 LTS (`node -v`)
- npm 10+ (`npm -v`)
- Angular CLI 21+ (`npm i -g @angular/cli@latest`)
- (Para o modo `solo`) URL pública dos remotes da Aula 1 — deploy preview com CORS liberado.

## Como rodar

Passo-a-passos detalhados de cada vídeo hands-on:
- [`../passo-a-passo-video-2.md`](../passo-a-passo-video-2.md) — `mfe-notificacoes`
- [`../passo-a-passo-video-3.md`](../passo-a-passo-video-3.md) — `shared-ui` + tema
- [`../passo-a-passo-video-4.md`](../passo-a-passo-video-4.md) — versionamento + modo `solo`

### Modos de execução

| Cenário | Comando | O que sobe localmente |
|---------|---------|-----------------------|
| Tudo local (debug profundo) | `npm run start:local` (precisa subir cada remote em 5 terminais) | host + 4 remotes em `localhost` |
| Só edito o host | `npm start` | só o host; remotes vêm do deploy preview |
| Edito **só** um remote (ex.: notificações) | Terminal A: `cd src/projects/mfe-notificacoes && npm start`<br>Terminal B (host): `npm run start:solo -- --mfe=mfe-notificacoes` | host + `mfe-notificacoes` local; demais remotes do preview |

### Atalhos de scripts

```bash
# Dev "padrão" — host local, todos remotes em deploy preview
npm start

# Dev full-local — todos os MFEs locais
npm run start:local

# Dev modo solo — só edito o MFE que passei em --mfe=
npm run start:solo -- --mfe=mfe-notificacoes
```

Os scripts internamente chamam `node scripts/use-manifest.mjs <modo>` antes do `ng serve host`. Esse script lê os manifests `federation.manifest.{local,dev,solo}.json` em `src/projects/host/public/` e gera o `federation.manifest.json` ativo.

## Estrutura dos arquivos novos / modificados nesta aula

```
fiap-mf-aula2/
├── README.md                                                ← este arquivo
├── package.json                                             ← novos scripts: start:local, start:solo, builds
├── scripts/
│   └── use-manifest.mjs                                     ← gera federation.manifest.json conforme o modo
├── src/
│   ├── projects/
│   │   ├── host/
│   │   │   ├── public/
│   │   │   │   ├── federation.manifest.json                 ← gerado (git-ignored)
│   │   │   │   ├── federation.manifest.local.json           ← todos em localhost
│   │   │   │   ├── federation.manifest.dev.json             ← todos em deploy preview
│   │   │   │   └── federation.manifest.solo.json            ← template do modo solo
│   │   │   └── src/app/
│   │   │       ├── app.ts                                   ← topbar agora carrega <Sino> remoto
│   │   │       ├── app.routes.ts                            ← rota /notificacoes carrega Pagina
│   │   │       └── pages/home.ts                            ← inalterado (continua compondo os 3 MFEs)
│   │   ├── mfe-produtos/                                    ← agora consome @fiap/shared-ui
│   │   ├── mfe-carrinho/                                    ← agora consome @fiap/shared-ui
│   │   ├── mfe-checkout/                                    ← agora consome @fiap/shared-ui
│   │   └── mfe-notificacoes/                                ← NOVO MFE
│   │       ├── federation.config.js                         ← exposes ./Sino e ./Pagina
│   │       └── src/app/
│   │           ├── sino-notificacoes.component.ts           ← componente único
│   │           ├── notificacoes-page.component.ts           ← página com router-outlet
│   │           ├── notificacoes-lista.component.ts          ← sub-rota interna
│   │           ├── notificacoes-config.component.ts         ← sub-rota interna
│   │           └── notificacoes.service.ts                  ← signal de contagem (escopo do remote)
│   └── projects/shared-ui/                                  ← NOVA LIB
│       ├── ng-package.json
│       ├── package.json
│       └── src/
│           ├── public-api.ts
│           └── lib/
│               ├── ui-button.component.ts
│               └── tokens.css                               ← :root { --fiap-cor-primaria: ...; }
└── .gitignore                                               ← + src/projects/host/public/federation.manifest.json
```

## Próxima aula

A **Aula 3** — *Integração Frontend-Backend: Comunicação, Autenticação e Controle de Acesso* — pega exatamente esse projeto e adiciona: serviço de autenticação compartilhado, comunicação entre MFEs, interceptors HTTP, e proteção de rotas.
