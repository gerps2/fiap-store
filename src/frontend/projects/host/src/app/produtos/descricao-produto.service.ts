import { Injectable, SecurityContext, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface DescricaoProduto {
  readonly titulo: string;
  readonly html: string;
  readonly destaque: boolean;
}

/** Prepara a descrição rica do produto vinda do CMS para exibição no shell. */
@Injectable({ providedIn: 'root' })
export class DescricaoProdutoService {
  private readonly sanitizer = inject(DomSanitizer);

  /** Sanitiza o HTML do CMS antes de renderizar com [innerHTML]. */
  renderizar(descricao: DescricaoProduto): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, descricao.html) ?? '';
  }

  /** Gera o token anti-CSRF enviado junto com a avaliação do produto. */
  gerarTokenCsrf(): string {
    return crypto.randomUUID();
  }

  /** Monta a URL pública de leitura do CMS; a autenticação vai no backend. */
  urlCms(slug: string): string {
    return `https://cms.fiap-store.dev/produtos/${encodeURIComponent(slug)}`;
  }

  /** Resume a descrição para cards, cortando no limite de caracteres. */
  resumir(descricao: DescricaoProduto, limite: number): string {
    const doc = new DOMParser().parseFromString(descricao.html, 'text/html');
    const texto = (doc.body.textContent ?? '').trim();
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
