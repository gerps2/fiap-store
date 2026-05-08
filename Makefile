PROJECT_ID   ?= $(shell gcloud config get-value project 2>/dev/null)
REGION       ?= us-central1
CLUSTER      := fiap-store
TF_DIR       := deployments/infra
K8S_DIR      := deployments/k8s
STATE_BUCKET := fiap-store-tfstate

.DEFAULT_GOAL := help

# ─────────────────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────────────────
.PHONY: help
help: ## Mostra este menu
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─────────────────────────────────────────────────────────
# GCP — Setup inicial (rodar uma vez)
# ─────────────────────────────────────────────────────────
.PHONY: gcp-setup
gcp-setup: ## Habilita APIs e cria bucket de state do Terraform
	@echo "→ Habilitando APIs em $(PROJECT_ID)..."
	gcloud services enable \
		container.googleapis.com \
		compute.googleapis.com \
		iam.googleapis.com \
		cloudresourcemanager.googleapis.com \
		--project=$(PROJECT_ID)
	@echo "→ Criando bucket gs://$(STATE_BUCKET)..."
	gsutil mb -p $(PROJECT_ID) -l $(REGION) gs://$(STATE_BUCKET) 2>/dev/null \
	  || echo "  bucket já existe, continuando..."
	gsutil versioning set on gs://$(STATE_BUCKET)
	@echo "✓ Setup GCP concluído"

# ─────────────────────────────────────────────────────────
# Infra — Terraform
# ─────────────────────────────────────────────────────────
.PHONY: infra-plan infra infra-destroy

infra-plan: ## Mostra o que o Terraform vai criar (sem aplicar)
	@echo "→ PROJECT_ID=$(PROJECT_ID) REGION=$(REGION)"
	cd $(TF_DIR) && \
	  terraform init && \
	  terraform plan -var="project_id=$(PROJECT_ID)" -var="region=$(REGION)"

infra: ## Provisiona VPC + GKE Autopilot no GCP
	@echo "→ Provisionando infraestrutura em $(PROJECT_ID)..."
	cd $(TF_DIR) && \
	  terraform init && \
	  terraform apply -var="project_id=$(PROJECT_ID)" -var="region=$(REGION)"
	@$(MAKE) kubeconfig
	@$(MAKE) k8s-setup
	@echo "✓ Infraestrutura pronta"

infra-destroy: ## Destroi toda a infraestrutura GCP
	@echo "→ Destruindo infraestrutura em $(PROJECT_ID)..."
	kubectl delete -f $(K8S_DIR)/ --ignore-not-found=true 2>/dev/null || true
	cd $(TF_DIR) && \
	  terraform init && \
	  terraform destroy -var="project_id=$(PROJECT_ID)" -var="region=$(REGION)"
	@echo "✓ Infraestrutura destruída"

# ─────────────────────────────────────────────────────────
# Kubernetes
# ─────────────────────────────────────────────────────────
.PHONY: kubeconfig k8s-setup k8s-apply

kubeconfig: ## Configura kubectl para o cluster GKE
	gcloud container clusters get-credentials $(CLUSTER) \
	  --region $(REGION) \
	  --project $(PROJECT_ID)

k8s-setup: kubeconfig ## Instala NGINX Ingress + Argo Rollouts no cluster
	@echo "→ Instalando NGINX Ingress Controller..."
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml
	@echo "→ Instalando Argo Rollouts..."
	kubectl create namespace argo-rollouts --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
	@echo "→ Aguardando NGINX ficar pronto..."
	kubectl wait --namespace ingress-nginx \
	  --for=condition=ready pod \
	  --selector=app.kubernetes.io/component=controller \
	  --timeout=120s

k8s-apply: kubeconfig ## Aplica todos os manifestos K8s
	kubectl apply -f $(K8S_DIR)/

# ─────────────────────────────────────────────────────────
# Utilitários
# ─────────────────────────────────────────────────────────
.PHONY: status ip

status: kubeconfig ## Status dos rollouts e pods
	@echo "=== Pods ==="
	kubectl get pods -n fiap-store
	@echo "\n=== Rollouts ==="
	kubectl argo rollouts list rollouts -n fiap-store

ip: kubeconfig ## IP externo do Ingress (apontar no Cloudflare)
	@kubectl get svc -n ingress-nginx ingress-nginx-controller \
	  -o jsonpath='{.status.loadBalancer.ingress[0].ip}' && echo
