import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ItemCarrinho {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

@Component({
  selector: 'mfe-carrinho',
  standalone: true,
  imports: [CommonModule],
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
    </section>
  `,
  styles: [`
    .carrinho {
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
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 12px;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    li:last-child {
      border-bottom: none;
    }
    .linha {
      display: flex;
      flex-direction: column;
    }
    .linha span {
      color: #888;
      font-size: 12px;
    }
    .subtotal {
      color: #1a1a1a;
      font-weight: 600;
    }
    .total {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 2px solid #ed145b;
      font-size: 16px;
    }
    .total strong {
      color: #ed145b;
    }
  `],
})
export class CarrinhoComponent {
  itens = signal<ItemCarrinho[]>([
    { nome: 'Camiseta FIAP Dev', quantidade: 2, precoUnitario: 89.9 },
    { nome: 'Caneca Angular Lover', quantidade: 1, precoUnitario: 39.9 },
  ]);

  total = computed(() =>
    this.itens().reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0),
  );
}
