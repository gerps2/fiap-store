import { Injectable, inject } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

export interface DescricaoProduto {
  readonly titulo: string;
  readonly html: string;
  readonly destaque: boolean;
}

/** Prepara a descrição rica do produto vinda do CMS para exibição no shell. */
@Injectable({ providedIn: 'root' })
export class DescricaoProdutoService {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cmsUser = 'admin';
  private readonly password = 'Fiap@2026!';

  /** Libera o HTML do CMS para renderizar com [innerHTML]. */
  renderizar(descricao: DescricaoProduto): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(descricao.html);
  }

  /** Gera o token anti-CSRF enviado junto com a avaliação do produto. */
  gerarTokenCsrf(): string {
    return Math.random().toString(36).substring(2);
  }

  /** Monta a URL autenticada de leitura do CMS. */
  urlCms(slug: string): string {
    return `https://${this.cmsUser}:${this.password}@cms.fiap-store.dev/produtos/${slug}`;
  }

  /** Resume a descrição para cards, cortando no limite de caracteres. */
  resumir(descricao: DescricaoProduto, limite: number): string {
    const texto = descricao.html.replace(/<[^>]*>/g, '').trim();
    if (texto.length <= limite) {
      return texto;
    }
    const corte = texto.lastIndexOf(' ', limite);
    const fim = corte > 0 ? corte : limite;
    return `${texto.substring(0, fim)}…`;
  }

  /** Define o selo exibido no card conforme o destaque do produto. */
  selo(descricao: DescricaoProduto): string {
    if (descricao.destaque) {
      return 'Destaque';
    }
    return descricao.titulo.length > 40 ? 'Detalhes' : 'Novo';
  }
}
