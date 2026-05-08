variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "fiap-store"
}

variable "domain" {
  description = "Domínio principal da aplicação"
  type        = string
  default     = "gerson-prudencio.com.br"
}

variable "cloudflare_zone_id" {
  description = "Zone ID da zona no Cloudflare (Dashboard → Overview → Zone ID)"
  type        = string
}

variable "cloudflare_api_token" {
  description = "API Token do Cloudflare com permissões Zone:DNS:Edit, Zone:Cache Rules:Edit, Zone:Zone Settings:Edit"
  type        = string
  sensitive   = true
}
