import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CHECKOUT, MY_CART, type OrderDto, UiButtonComponent, UiInputComponent } from '@fiap/shared';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'mfe-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButtonComponent, UiInputComponent],
  template: `
    <section class="checkout">
      <h3>Finalizar pedido</h3>

      @if (!pedido()) {
        <form (ngSubmit)="finalizar()" #form="ngForm">
          <ui-input label="Nome completo" name="nome" [(ngModel)]="nome" required />
          <ui-input label="E-mail" type="email" name="email" [(ngModel)]="email" required />
          <ui-button type="submit" [disabled]="!form.valid">Finalizar pedido</ui-button>
          @if (erro()) {
            <p class="erro">{{ erro() }}</p>
          }
        </form>
      } @else {
        <p class="ok">
          Pedido #{{ pedido()?.id?.slice(0, 8) }} confirmado para <strong>{{ nome }}</strong>.
          Total: R$ {{ (pedido()?.totalCents ?? 0) / 100 | number:'1.2-2' }}. Enviamos um e-mail para {{ email }}.
        </p>
      }
    </section>
  `,
  styles: [`
    .checkout { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    h3 { margin: 0 0 12px; font-size: 16px; color: var(--fiap-color-text); }
    form { display: flex; flex-direction: column; gap: 12px; }
    .erro { margin: 0; color: var(--fiap-color-brand); font-size: 13px; }
    .ok { margin: 0; padding: 12px; border-radius: 6px; border: 1px solid var(--fiap-color-success); color: var(--fiap-color-success); font-size: 14px; }
  `],
})
export class CheckoutComponent {
  private readonly apollo = inject(Apollo);

  nome = '';
  email = '';
  protected readonly pedido = signal<OrderDto | null>(null);
  protected readonly erro = signal('');

  async finalizar(): Promise<void> {
    this.erro.set('');
    try {
      const resultado = await firstValueFrom(
        this.apollo.mutate<{ checkout: OrderDto }>({ mutation: CHECKOUT, refetchQueries: [{ query: MY_CART }] }),
      );
      this.pedido.set(resultado.data?.checkout ?? null);
    } catch (falha) {
      this.erro.set(falha instanceof Error ? falha.message : 'Não foi possível finalizar o pedido.');
    }
  }
}
