# fiap-store

Exemplo de arquitetura de **Micro Frontends com Angular 21** usando `@angular-architects/native-federation`: um host que carrega dinamicamente três aplicações independentes (remotes).

---

## Visão geral da arquitetura

```
┌─────────────────────────────────────┐
│           host  :4200               │
│  (shell: topbar + menu + roteamento)│
│                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │mfe-produtos│ │mfe-carrinho│ │mfe-checkout│ │
│  │   :4201   │ │   :4202   │ │   :4203   │ │
│  └────────────┘ └────────────┘ └────────────┘ │
└─────────────────────────────────────┘
```

O **host** é o shell da aplicação. Ele não conhece os remotes em tempo de compilação — descobre onde eles estão em runtime lendo o `federation.manifest.json`. Cada **remote** é um app Angular autônomo que expõe um componente via Native Federation.

### Aplicações

| App | Porta | Tipo | O que faz |
|---|---|---|---|
| `host` | 4200 | `dynamic-host` | Shell com topbar, menu de navegação e `<router-outlet>`. Carrega os remotes dinamicamente. |
| `mfe-produtos` | 4201 | `remote` | Catálogo de produtos. Expõe `ProdutosComponent`. |
| `mfe-carrinho` | 4202 | `remote` | Carrinho com total reativo via `signal`/`computed`. Expõe `CarrinhoComponent`. |
| `mfe-checkout` | 4203 | `remote` | Formulário de finalização de pedido. Expõe `CheckoutComponent`. |

---

## Como os remotes são carregados

### Na home — composição simultânea

A página home exibe os três MFEs empilhados na mesma tela. O carregamento é feito com `Promise.all` + `loadRemoteModule` + `ViewContainerRef.createComponent`:

```ts
// host/src/app/pages/home.ts (simplificado)
const [Produtos, Carrinho, Checkout] = await Promise.all([
  loadRemoteModule('mfe-produtos', './Component'),
  loadRemoteModule('mfe-carrinho', './Component'),
  loadRemoteModule('mfe-checkout', './Component'),
]);
```

Os três remotes são resolvidos em paralelo e instanciados como componentes independentes no DOM.

### Nas rotas — carregamento isolado

Cada rota carrega um único MFE sob demanda (lazy loading):

```ts
// host/src/app/app.routes.ts (simplificado)
{
  path: 'produtos',
  loadComponent: () => loadRemoteModule('mfe-produtos', './Component')
}
```

O remote só é baixado quando o usuário navega para aquela rota.

### O manifesto de federação

O host descobre os remotes através de `public/federation.manifest.json`:

```json
{
  "mfe-produtos":  { "remoteEntry": "http://localhost:4201/remoteEntry.json" },
  "mfe-carrinho":  { "remoteEntry": "http://localhost:4202/remoteEntry.json" },
  "mfe-checkout":  { "remoteEntry": "http://localhost:4203/remoteEntry.json" }
}
```

Em produção, basta trocar as URLs para apontar para os domínios reais de cada remote — sem recompilar o host.

---

## Estrutura dos arquivos

```
fiap-store/
├── README.md
└── src/
    ├── package.json                                   ← scripts npm run start:*
    ├── angular.json
    ├── tsconfig.json
    └── projects/
        ├── host/
        │   ├── public/federation.manifest.json        ← URLs dos remotes em runtime
        │   └── src/app/
        │       ├── app.ts                             ← topbar + menu + router-outlet
        │       ├── app.routes.ts                      ← rotas com loadRemoteModule
        │       └── pages/home.ts                      ← composição dos 3 MFEs
        ├── mfe-produtos/
        │   ├── federation.config.js                   ← declara o que este remote expõe
        │   └── src/app/produtos.component.ts
        ├── mfe-carrinho/
        │   ├── federation.config.js
        │   └── src/app/carrinho.component.ts
        └── mfe-checkout/
            ├── federation.config.js
            └── src/app/checkout.component.ts
```

---

## Pré-requisitos

- Node.js 24 LTS — `node -v`
- npm 10+ — `npm -v`
- Angular CLI 21+ — `npm i -g @angular/cli@latest`

---

## Como rodar

```bash
cd src
npm install

# Abra 4 terminais e rode nesta ordem (remotes antes do host):
npm run start:produtos   # http://localhost:4201
npm run start:carrinho   # http://localhost:4202
npm run start:checkout   # http://localhost:4203
npm run start:host       # http://localhost:4200
```

### URLs disponíveis

| URL | O que você verá |
|---|---|
| `http://localhost:4200/` | Home com os 3 MFEs compostos na mesma página |
| `http://localhost:4200/produtos` | Apenas `mfe-produtos` carregado via rota |
| `http://localhost:4200/carrinho` | Apenas `mfe-carrinho` carregado via rota |
| `http://localhost:4200/checkout` | Apenas `mfe-checkout` carregado via rota |
| `http://localhost:4201` | `mfe-produtos` rodando standalone |
| `http://localhost:4202` | `mfe-carrinho` rodando standalone |
| `http://localhost:4203` | `mfe-checkout` rodando standalone |

> Os remotes rodam standalone porque são apps Angular completos — útil para desenvolvimento e debug isolado de cada time.

---

## Conceitos aplicados

- **Workspace multi-app** — um único repositório com `host` e remotes independentes.
- **Native Federation** — implementação de Module Federation nativa para Angular (sem Webpack), baseada em ES Modules e import maps.
- **Dynamic host** — o host resolve os remotes em runtime via manifesto JSON, sem acoplamento em tempo de build.
- **`loadRemoteModule`** — função que baixa e instancia um componente de outro app em tempo de execução.
- **Composição vs. roteamento** — dois padrões distintos de integração: múltiplos MFEs numa mesma página ou cada MFE isolado em sua rota.
- **Signals e `computed`** — estado reativo no `mfe-carrinho` sem necessidade de bibliotecas externas.
