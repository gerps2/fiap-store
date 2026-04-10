import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Produto {
  nome: string;
  preco: number;
}

@Component({
  selector: 'mfe-produtos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="produtos">
      <h3>Catalogo</h3>
      <ul>
        @for (p of produtos; track p.nome) {
          <li>
            <strong>{{ p.nome }}</strong>
            <span>R$ {{ p.preco | number:'1.2-2' }}</span>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [`
    .produtos {
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
      margin: 0;
    }
    li {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    li:last-child {
      border-bottom: none;
    }
    li strong {
      color: #1a1a1a;
    }
    li span {
      color: #ed145b;
      font-weight: 600;
    }
  `],
})
export class ProdutosComponent {
  produtos: Produto[] = [
    { nome: 'Camiseta FIAP Dev', preco: 89.9 },
    { nome: 'Caneca Angular Lover', preco: 39.9 },
    { nome: 'Livro Microfrontends', preco: 129.9 },
  ];
}
