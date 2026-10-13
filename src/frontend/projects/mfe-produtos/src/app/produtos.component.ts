import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ADD_TO_CART,
  HasGroupDirective,
  LIST_PRODUCTS,
  NotificationHubService,
  type ProductDto,
  UiButtonComponent,
  UiRemoteOutletComponent,
} from '@fiap/shared';
import { Apollo } from 'apollo-angular';

interface Produto {
  id: string;
  nome: string;
  preco: number;
}

@Component({
  selector: 'mfe-produtos',
  standalone: true,
  imports: [CommonModule, RouterLink, HasGroupDirective, UiButtonComponent, UiRemoteOutletComponent],
  template: `
    <section class="produtos">
      <header class="cabecalho">
        <h3>Catalogo</h3>
        <a *hasGroup="'admin'" routerLink="/admin/products/new" class="novo">+ Novo produto</a>
        <div class="alertas">
          <span>Alertas do catalogo</span>
          <ui-remote-outlet remote="mfe-notificacoes" exposed="./Sino" [compact]="true" />
        </div>
      </header>
      <ul>
        @for (p of produtos(); track p.id) {
          <li>
            <strong>{{ p.nome }}</strong>
            <span>R$ {{ p.preco | number:'1.2-2' }}</span>
            <ui-button size="sm" (click)="adicionar(p)">Adicionar</ui-button>
          </li>
        }
        @empty {
          <li>{{ carregando() ? 'Carregando catalogo...' : 'Nenhum produto encontrado.' }}</li>
        }
      </ul>
    </section>
  `,
  styles: [`
    .produtos { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    .cabecalho { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .novo { color: var(--fiap-color-brand); font-size: 13px; font-weight: 600; text-decoration: none; }
    .alertas { display: flex; align-items: center; gap: 4px; color: var(--fiap-color-muted); font-size: 12px; }
    h3 { margin: 0; font-size: 16px; color: var(--fiap-color-text); }
    ul { list-style: none; padding: 0; margin: 0; }
    li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    li:last-child { border-bottom: none; }
    li strong { flex: 1; color: var(--fiap-color-text); }
    li span { color: var(--fiap-color-brand); font-weight: 600; }
  `],
})
export class ProdutosComponent {
  private readonly apollo = inject(Apollo);
  private readonly hub = inject(NotificationHubService);
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);

  constructor() {
    const consulta = this.apollo
      .watchQuery<{ listProducts: ProductDto[] }>({ query: LIST_PRODUCTS, fetchPolicy: 'cache-and-network' })
      .valueChanges.subscribe((resultado) => {
        this.carregando.set(resultado.loading);
        const lista = (resultado.data?.listProducts ?? []) as ProductDto[];
        this.produtos.set(lista.map((p) => ({ id: p.id, nome: p.name, preco: p.priceCents / 100 })));
      });
    inject(DestroyRef).onDestroy(() => consulta.unsubscribe());
  }

  adicionar(produto: Produto): void {
    this.apollo.mutate({ mutation: ADD_TO_CART, variables: { productId: produto.id } }).subscribe({
      next: () => this.hub.success('Adicionado ao carrinho', produto.nome),
      error: () => undefined,
    });
  }
}
