# fiap-store

Monorepo de referência das aulas da disciplina *Arquitetura Angular para Aplicações de Alta Escala* (FIAP PosTech). Cada aula vive em uma **branch**; este `README` é o mapa do repo e do estado da branch `main`.

## Arquitetura

O repo está dividido em dois mundos explícitos — frontend e backend na mesma árvore, cada um com seu próprio `package.json`:

```
fiap-store/
├── README.md                         ← este arquivo
├── scripts/
│   └── use-manifest.mjs              ← gera federation.manifest.json conforme o modo (local/dev/solo)
└── src/
    ├── frontend/                     ← Angular 21 workspace (host + MFEs + libs compartilhadas)
    │   ├── angular.json
    │   ├── package.json              ← deps e scripts do frontend
    │   ├── tsconfig.json
    │   └── projects/
    │       ├── host/                 ← host (4200) — dynamic-host + Apollo shared
    │       ├── mfe-produtos/         ← remote (4201)
    │       ├── mfe-carrinho/         ← remote (4202)
    │       ├── mfe-checkout/         ← remote (4203)
    │       ├── mfe-notificacoes/     ← remote (4204) — hub global de notificações (a partir da Aula 3)
    │       ├── shared-ui/            ← lib (UiButton + tokens CSS + *hasGroup + <ui-toast>)
    │       └── shared-context/       ← lib (UserContextService — Aula 3)
    └── backend/                      ← NestJS 10 monolito modular (a partir da Aula 3)
        ├── package.json              ← deps e scripts do backend
        ├── db.sqlite                 ← criado no boot (gitignored)
        └── src/
            ├── auth/                 ← REST (signup, login, refresh, logout, csrf)
            ├── users/                ← REST (/users/me)
            ├── products/             ← GraphQL
            ├── cart/                 ← GraphQL
            ├── orders/               ← GraphQL
            ├── notifications/        ← GraphQL + subscription (graphql-ws)
            └── common/               ← filters, guards, middleware globais
```

### Por que `src/frontend` e `src/backend` separados

- **Clareza didática:** o aluno abre a raiz e vê onde fica cada código.
- **Dependências isoladas:** cada lado tem seu `package.json`, seus scripts, seu `node_modules`.
- **Coexistência REST + GraphQL no mesmo backend** é um ponto pedagógico da Aula 3 — ter um diretório único pra isso reforça o conceito.

## Branches por aula

| Branch | Tema | Estado |
|---|---|---|
| `main` | Base + docs | estável |
| `aula-02` | Module Federation: Isolamento, Compartilhamento e Versionamento | ✅ concluída |
| `aula-03` | Comunicação, GraphQL e Segurança | 🚧 em produção |

Cada aula parte da branch anterior. Tags marcam checkpoints relevantes dentro da branch.

## Branches da Aula 3

A Aula 3 é dividida em duas partes, cada uma com uma branch dedicada pra facilitar o acompanhamento vídeo a vídeo:

| Branch | Descrição |
|---|---|
| `aula-03` | Estado de partida — frontend reorganizado em `src/frontend/`, backend NestJS bootstrapado em `src/backend/`, lib `@fiap/shared` unificada. Sem Apollo, sem auth funcional. |
| `aula-03-parte-1` | Estado após V2 — Apollo Client + login REST + cookies httpOnly + CSRF double-submit + refresh rotativo com reuse detection. |
| `aula-03-parte-2` | Estado final — RBAC em 3 camadas (`*hasGroup` + `canMatch` + `@Roles`) + exception filter com traceId + ErrorLink + hub via BroadcastChannel + Socket.IO com `io.use` + rooms `user:<sub>`. |

---

## Apps após a branch atual

| App | Porta | Tipo | O que faz |
|---|---|---|---|
| `host` | 4200 | `dynamic-host` | Topbar + rotas + composição da home. A partir da Aula 3: Apollo Client compartilhado + UserContextService |
| `mfe-produtos` | 4201 | `remote` | Catálogo (GraphQL `products`) |
| `mfe-carrinho` | 4202 | `remote` | Carrinho (GraphQL `myCart` + mutations) |
| `mfe-checkout` | 4203 | `remote` | Checkout (GraphQL `mutation checkout`) |
| `mfe-notificacoes` | 4204 | `remote` | Hub de notificações (subscription `notificationAdded` + toast) |
| `shared-ui` (lib) | — | library | `UiButtonComponent` + `tokens.css` + `*hasGroup` + `<ui-toast>` |
| `shared-context` (lib) | — | library | `UserContextService` (signal do usuário logado) |

## Pré-requisitos

- Node.js 24 LTS (`node -v`)
- npm 10+ (`npm -v`)
- Angular CLI 21+ (`npm i -g @angular/cli@latest`)
- **Zero Docker** — banco é SQLite (arquivo local).
- (Modo `solo` do frontend) URL pública dos remotes em deploy preview com CORS liberado.

## Como rodar

### Backend (API)

```bash
cd src/backend
npm install
npm run gen:keys          # gera par ES256 no .env (1ª vez)
npm run start:dev         # cria db.sqlite + roda migrations + seed + sobe em :3000
```

Logins pré-seed (criados pela migration `SeedUsers`):
- **admin**: `admin@fiap.com` / `admin123`
- **cliente**: `cliente@fiap.com` / `cliente123`

Endpoints principais:
- REST — `POST /auth/signup | /auth/login | /auth/refresh | /auth/logout`, `GET /auth/csrf`, `GET /users/me`, `GET /health`
- GraphQL playground — http://localhost:3000/graphql

### Frontend (MFEs)

```bash
cd src/frontend
npm install
npm run start:local       # sobe host + 4 remotes em localhost (5 terminais via concurrently)
# ou
npm start                 # host local, remotes vêm do deploy preview
# ou
npm run start:solo -- --mfe=mfe-notificacoes   # só edito um remote; resto do preview
```

O script `scripts/use-manifest.mjs` (raiz do repo) gera `src/frontend/projects/host/public/federation.manifest.json` conforme o modo (`local` / `dev` / `solo`) antes do `ng serve`.

---

## Histórico de aulas anteriores

- **Aula 2 (branch `aula-02`)** — adicionou `mfe-notificacoes`, lib `shared-ui`, manifests por ambiente e modo `solo`.
- **Aula 3 (branch `aula-03`, esta)** — adiciona backend NestJS (REST + GraphQL), JWT seguro com cookies httpOnly, RBAC em camadas, erro centralizado e hub de notificações via subscription.

## Próxima aula

A **Aula 4** — *CI e Governança Técnica* — parte desta e foca em pipelines, affected builds e quality gates.
