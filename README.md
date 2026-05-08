# fiap-store

Monorepo de referência das aulas da disciplina *Arquitetura Angular para Aplicações de Alta Escala* (FIAP PosTech 8FRNT Fase 2). Cada aula vive em uma **branch**; este `README` cobre o estado da branch `aula-05` — a versão completa com Docker, Kubernetes e pipeline de deploy.

## Estrutura do repositório

```
fiap-store/
├── src/
│   ├── frontend/                     ← Angular 21 workspace
│   │   └── projects/
│   │       ├── host/                 ← Shell app (porta 4200)
│   │       ├── mfe-produtos/         ← MFE Produtos (porta 4201)
│   │       ├── mfe-carrinho/         ← MFE Carrinho (porta 4202)
│   │       ├── mfe-checkout/         ← MFE Checkout (porta 4203)
│   │       ├── mfe-notificacoes/     ← MFE Notificações (porta 4204)
│   │       ├── shared-ui/            ← Lib de componentes
│   │       └── shared-context/       ← Lib de contexto do usuário
│   └── backend/                      ← NestJS 10 (porta 3000)
│       └── .keys/                    ← Chaves ES256 para JWT (geradas em dev)
├── deployments/
│   ├── docker/                       ← Dockerfiles por serviço
│   │   ├── shell/
│   │   ├── mfe-produtos/
│   │   ├── mfe-carrinho/
│   │   ├── mfe-checkout/
│   │   ├── mfe-notificacoes/
│   │   └── backend/
│   ├── k8s/                          ← Manifests Kubernetes + Argo Rollouts
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── backend-keys-secret.yaml  ← Secret com chaves JWT do backend
│   │   ├── shell-rollout.yaml        ← Canary
│   │   ├── mfe-produtos-rollout.yaml ← Blue/Green
│   │   ├── mfe-carrinho-rollout.yaml ← Canary
│   │   ├── mfe-checkout-rollout.yaml ← Blue/Green
│   │   ├── mfe-notificacoes-rollout.yaml ← Canary
│   │   └── ingress.yaml
│   └── infra/                        ← Terraform (GCP + Cloudflare)
│       ├── main.tf
│       ├── cloudflare.tf
│       ├── variables.tf
│       └── outputs.tf
├── .github/
│   └── workflows/
│       ├── CI.yaml                   ← Lint + test + build + docker validation
│       ├── deploy-infra.yaml         ← Terraform apply (manual)
│       ├── deploy-app.yaml           ← Build + push + deploy (tag v*.*.*)
│       └── infra-destroy.yaml        ← Terraform destroy (manual)
└── scripts/
    └── use-manifest.mjs              ← Gera federation.manifest.json por modo
```

## Branches por aula

| Branch | Tema | Estado |
|---|---|---|
| `aula-02` | Module Federation | ✅ concluída |
| `aula-03` | Comunicação, GraphQL e Segurança | ✅ concluída |
| `aula-04` | CI e Governança Técnica | ✅ concluída |
| `aula-05` | Deploy Enterprise | ✅ concluída |

## Desenvolvimento local

### Backend

```bash
cd src/backend
npm install
npm run gen:keys          # gera par ES256 em .keys/ (apenas 1ª vez)
npm run start:dev         # cria db.sqlite + migrations + seed + inicia em :3000
```

Logins pré-seed: `admin@fiap.com / admin123` · `cliente@fiap.com / cliente123`

### Frontend

```bash
cd src/frontend
npm install
npm run start:local       # host + todos os MFEs em localhost (concurrently)
```

## GitFlow

```
feature/* ─── PR ──▶ develop ─── PR ──▶ main ─── git tag v*.*.* ──▶ deploy
                       ▲                  ▲
                    CI.yaml            CI.yaml
```

| Evento | Workflow |
|---|---|
| PR aberto para `develop` ou `main` | `CI.yaml` — lint → test → build → docker build |
| `workflow_dispatch` com confirmação `apply` | `deploy-infra.yaml` — terraform apply |
| Push de tag `v*.*.*` | `deploy-app.yaml` — build + push GHCR + deploy GKE |
| `workflow_dispatch` com confirmação `destroy` | `infra-destroy.yaml` — terraform destroy |

## Deploy passo a passo

### 1. Provisionar infraestrutura (uma vez)

```
GitHub → Actions → Infra — Terraform Apply → Run workflow
Digite "apply" e confirme
```

Cria: VPC, GKE Autopilot cluster (`us-central1`), Cloudflare DNS + cache rules.

Instala automaticamente: NGINX Ingress Controller + Argo Rollouts no cluster.

### 2. Criar feature e abrir PR

```bash
git checkout develop
git checkout -b feature/minha-feature
# ... desenvolve ...
git push origin feature/minha-feature
# Abre PR → develop — CI.yaml roda automaticamente
```

### 3. Deploy em produção

```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
# deploy-app.yaml dispara automaticamente
```

O pipeline faz:
1. Build das 6 imagens Docker (`shell`, `mfe-*` × 4, `backend`)
2. Push para GHCR: `ghcr.io/gerps2/fiap-store-{serviço}:{versão}`
3. `kubectl apply` dos manifests Kubernetes
4. `kubectl argo rollouts set image` para os 5 MFEs
5. `kubectl set image deployment/backend` para o backend

### 4. Acompanhar e promover o rollout

```bash
# Instalar plugin localmente
brew install argoproj/tap/kubectl-argo-rollouts

# Ver status de todos os rollouts
kubectl argo rollouts list rollouts -n fiap-store

# Promover canary para próxima etapa (10%→30%→60%→100%)
kubectl argo rollouts promote shell -n fiap-store

# Abortar e reverter para versão anterior
kubectl argo rollouts abort shell -n fiap-store
```

### 5. Destruir infraestrutura (após uso)

```
GitHub → Actions → Infra — Terraform Destroy → Run workflow
Digite "destroy" e confirme
```

## Imagens Docker

| Serviço | Imagem GHCR |
|---|---|
| Shell (host app) | `ghcr.io/gerps2/fiap-store-shell:{versão}` |
| MFE Produtos | `ghcr.io/gerps2/fiap-store-mfe-produtos:{versão}` |
| MFE Carrinho | `ghcr.io/gerps2/fiap-store-mfe-carrinho:{versão}` |
| MFE Checkout | `ghcr.io/gerps2/fiap-store-mfe-checkout:{versão}` |
| MFE Notificações | `ghcr.io/gerps2/fiap-store-mfe-notificacoes:{versão}` |
| Backend NestJS | `ghcr.io/gerps2/fiap-store-backend:{versão}` |

## Estratégias de deploy por serviço

| Serviço | Estratégia | Motivo |
|---|---|---|
| `shell` | Canary (10%→30%→60%) | Exposição gradual para detectar regressões |
| `mfe-carrinho` | Canary | Fluxo de UX — validação com tráfego real |
| `mfe-notificacoes` | Canary | Feature incremental de baixo risco |
| `mfe-produtos` | Blue/Green | Catálogo — mudanças críticas validadas antes da promoção |
| `mfe-checkout` | Blue/Green | Fluxo transacional — zero risco antes da promoção |
| `backend` | Rolling Update | API REST/GraphQL — atualização padrão Kubernetes |

## Pré-requisitos para deploy

- Conta GCP com Free Trial ou créditos ativos
- Zona Cloudflare configurada para o domínio
- Secrets no GitHub: `GCP_PROJECT_ID`, `TF_VAR_CLOUDFLARE_ZONE_ID`, `TF_VAR_CLOUDFLARE_API_TOKEN`
- Workload Identity Federation configurado (sem JSON key)
