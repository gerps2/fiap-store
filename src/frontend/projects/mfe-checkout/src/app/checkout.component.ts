import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent, UiInputComponent } from '@fiap/shared';

@Component({
  selector: 'mfe-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButtonComponent, UiInputComponent],
  template: `
    <section class="checkout">
      <h3>Finalizar pedido</h3>

      @if (!confirmado()) {
        <form (ngSubmit)="finalizar()" #form="ngForm">
          <ui-input label="Nome completo" name="nome" [(ngModel)]="nome" required />
          <ui-input label="E-mail" type="email" name="email" [(ngModel)]="email" required />
          <ui-button type="submit" [disabled]="!form.valid">Finalizar pedido</ui-button>
        </form>
      } @else {
        <p class="ok">
          Pedido confirmado para <strong>{{ nome }}</strong>. Enviamos um e-mail para {{ email }}.
        </p>
      }
    </section>
  `,
  styles: [`
    .checkout { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    h3 { margin: 0 0 12px; font-size: 16px; color: var(--fiap-color-text); }
    form { display: flex; flex-direction: column; gap: 12px; }
    .ok { margin: 0; padding: 12px; border-radius: 6px; border: 1px solid var(--fiap-color-success); color: var(--fiap-color-success); font-size: 14px; }
  `],
})
export class CheckoutComponent {
  nome = '';
  email = '';
  confirmado = signal(false);

  finalizar(): void {
    this.confirmado.set(true);
  }
}
