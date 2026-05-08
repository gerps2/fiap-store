provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "kubernetes" {
  host  = "https://${google_container_cluster.main.endpoint}"
  token = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.main.master_auth[0].cluster_ca_certificate
  )
}

data "google_client_config" "default" {}

data "kubernetes_service" "ingress_nginx" {
  metadata {
    name      = "ingress-nginx-controller"
    namespace = "ingress-nginx"
  }

  depends_on = [google_container_cluster.main]
}

locals {
  ingress_ip = data.kubernetes_service.ingress_nginx.status[0].load_balancer[0].ingress[0].ip
}

resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  type    = "A"
  content = local.ingress_ip
  proxied = true
}

resource "cloudflare_zone_settings_override" "main" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl              = "flexible"
    always_use_https = "on"
    min_tls_version  = "1.2"
    http3            = "on"
  }

  lifecycle {
    ignore_changes = all
  }
}

resource "cloudflare_ruleset" "cache_rules" {
  zone_id = var.cloudflare_zone_id
  name    = "fiap-store cache rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    description = "No cache for index.html"
    expression  = "(http.request.uri.path eq \"/index.html\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = false
    }
  }

  rules {
    description = "Cache imutável para assets JS e CSS"
    expression  = "(ends_with(http.request.uri.path, \".js\") or ends_with(http.request.uri.path, \".css\"))"
    action      = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 31536000
      }
      browser_ttl {
        mode    = "override_origin"
        default = 31536000
      }
    }
  }
}
