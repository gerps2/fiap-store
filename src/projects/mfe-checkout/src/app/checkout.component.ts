import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'mfe-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="checkout">
      <h3>Finalizar pedido</h3>

      @if (!confirmado()) {
        <form (ngSubmit)="finalizar()" #form="ngForm">
          <label>
            Nome completo
            <input type="text" name="nome" [(ngModel)]="nome" required />
          </label>
          <label>
            E-mail
            <input type="email" name="email" [(ngModel)]="email" required />
          </label>
          <button type="submit" [disabled]="!form.valid">
            Finalizar pedido
          </button>
        </form>
      } @else {
        <p class="ok">
          Pedido confirmado para <strong>{{ nome }}</strong>. Enviamos um e-mail para {{ email }}.
        </p>
      }
    </section>
  `,
  styles: [`
    .checkout {
      padding: 16px;
      border: 1px solid #e4e4e4;
      border-radius: 8px;
      background: #fff;
    }
    h3 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #333;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    label {
      display: flex;
      flex-direction: column;
      font-size: 12px;
      color: #555;
      gap: 4px;
    }
    input {
      padding: 8px 10px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
    }
    input:focus {
      outline: none;
      border-color: #ed145b;
    }
    button {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      background: #ed145b;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .ok {
      margin: 0;
      padding: 12px;
      border-radius: 6px;
      background: #eafbe7;
      color: #1f6e15;
      font-size: 14px;
    }
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
