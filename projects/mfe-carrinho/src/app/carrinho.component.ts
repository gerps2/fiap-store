import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UiButtonComponent } from '@fiap/shared-ui';

interface ItemCarrinho {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

@Component({
  selector: 'mfe-carrinho',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <section class="carrinho">
      <h3>Itens no carrinho</h3>
      <ul>
        @for (item of itens(); track item.nome) {
          <li>
            <div class="linha">
              <strong>{{ item.nome }}</strong>
              <span>{{ item.quantidade }} x R$ {{ item.precoUnitario | number:'1.2-2' }}</span>
            </div>
            <div class="subtotal">
              R$ {{ item.quantidade * item.precoUnitario | number:'1.2-2' }}
            </div>
          </li>
        }
      </ul>
      <div class="total">
        <span>Total</span>
        <strong>R$ {{ total() | number:'1.2-2' }}</strong>
      </div>
      <ui-button class="finalizar" (click)="finalizar()">Finalizar compra</ui-button>
    </section>
  `,
  styles: [`
    .carrinho { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    h3 { margin: 0 0 12px; font-size: 16px; color: var(--fiap-color-text); }
    ul { list-style: none; padding: 0; margin: 0 0 12px; }
    li { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    li:last-child { border-bottom: none; }
    .linha { display: flex; flex-direction: column; }
    .linha span { color: var(--fiap-color-muted); font-size: 12px; }
    .subtotal { color: var(--fiap-color-text); font-weight: 600; }
    .total { display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid var(--fiap-color-brand); font-size: 16px; }
    .total strong { color: var(--fiap-color-brand); }
    .finalizar { margin-top: 12px; }
  `],
})
export class CarrinhoComponent {
  private readonly router = inject(Router);

  itens = signal<ItemCarrinho[]>([
    { nome: 'Camiseta FIAP Dev', quantidade: 2, precoUnitario: 89.9 },
    { nome: 'Caneca Angular Lover', quantidade: 1, precoUnitario: 39.9 },
  ]);

  total = computed(() =>
    this.itens().reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0),
  );

  constructor() {
    const aoAdicionar = (ev: Event) => this.adicionar((ev as CustomEvent<{ nome: string; preco: number }>).detail);
    window.addEventListener('fiap:cart:add', aoAdicionar);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('fiap:cart:add', aoAdicionar));
  }

  protected finalizar(): void {
    void this.router.navigateByUrl('/checkout');
  }

  private adicionar(produto: { nome: string; preco: number }): void {
    this.itens.update((lista) => {
      const existe = lista.some((item) => item.nome === produto.nome);
      return existe
        ? lista.map((item) => (item.nome === produto.nome ? { ...item, quantidade: item.quantidade + 1 } : item))
        : [...lista, { nome: produto.nome, quantidade: 1, precoUnitario: produto.preco }];
    });
    window.dispatchEvent(new CustomEvent('fiap:notify', { detail: { titulo: `Adicionado ao carrinho: ${produto.nome}` } }));
  }
}
