import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AUTH_CHANGED_EVENT, type CartDto, MY_CART, UiButtonComponent } from '@fiap/shared';
import { Apollo } from 'apollo-angular';

@Component({
  selector: 'mfe-carrinho',
  standalone: true,
  imports: [CommonModule, UiButtonComponent],
  template: `
    <section class="carrinho">
      <h3>Itens no carrinho</h3>
      <ul>
        @for (item of itens(); track item.id) {
          <li>
            <div class="linha">
              <strong>{{ item.product.name }}</strong>
              <span>{{ item.quantity }} x R$ {{ item.product.priceCents / 100 | number:'1.2-2' }}</span>
            </div>
            <div class="subtotal">
              R$ {{ item.quantity * item.product.priceCents / 100 | number:'1.2-2' }}
            </div>
          </li>
        } @empty {
          <li class="vazio">{{ aviso() }}</li>
        }
      </ul>
      <div class="total">
        <span>Total</span>
        <strong>R$ {{ total() | number:'1.2-2' }}</strong>
      </div>
      <ui-button class="finalizar" [disabled]="itens().length === 0" (click)="finalizar()">Finalizar compra</ui-button>
    </section>
  `,
  styles: [`
    .carrinho { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    h3 { margin: 0 0 12px; font-size: 16px; color: var(--fiap-color-text); }
    ul { list-style: none; padding: 0; margin: 0 0 12px; }
    li { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    li:last-child { border-bottom: none; }
    .vazio { color: var(--fiap-color-muted); }
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
  private readonly apollo = inject(Apollo);
  private readonly carrinho = signal<CartDto | null>(null);

  protected readonly itens = computed(() => this.carrinho()?.items ?? []);
  protected readonly total = computed(() => (this.carrinho()?.totalCents ?? 0) / 100);
  protected readonly aviso = signal('Seu carrinho está vazio.');

  constructor() {
    const consulta = this.apollo.watchQuery<{ myCart: CartDto }>({
      query: MY_CART,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    });
    const assinatura = consulta.valueChanges.subscribe((resultado) => {
      this.carrinho.set((resultado.data?.myCart as CartDto | undefined) ?? null);
      this.aviso.set(resultado.errors?.length ? 'Entre para ver seu carrinho.' : 'Seu carrinho está vazio.');
    });
    const recarregar = () => void consulta.refetch().catch(() => this.carrinho.set(null));
    window.addEventListener(AUTH_CHANGED_EVENT, recarregar);
    inject(DestroyRef).onDestroy(() => {
      assinatura.unsubscribe();
      window.removeEventListener(AUTH_CHANGED_EVENT, recarregar);
    });
  }

  protected finalizar(): void {
    void this.router.navigateByUrl('/checkout');
  }
}
