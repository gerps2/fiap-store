import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent, UiRemoteOutletComponent } from '@fiap/shared';

interface Produto {
  nome: string;
  preco: number;
}

@Component({
  selector: 'mfe-produtos',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiRemoteOutletComponent],
  template: `
    <section class="produtos">
      <header class="cabecalho">
        <h3>Catalogo</h3>
        <div class="alertas">
          <span>Alertas do catalogo</span>
          <ui-remote-outlet remote="mfe-notificacoes" exposed="./Sino" [compact]="true" />
        </div>
      </header>
      <ul>
        @for (p of produtos; track p.nome) {
          <li>
            <strong>{{ p.nome }}</strong>
            <span>R$ {{ p.preco | number:'1.2-2' }}</span>
            <ui-button size="sm" (click)="adicionar(p)">Adicionar</ui-button>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [`
    .produtos { padding: 16px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); }
    .cabecalho { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
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
  produtos: Produto[] = [
    { nome: 'Camiseta FIAP Dev', preco: 89.9 },
    { nome: 'Caneca Angular Lover', preco: 39.9 },
    { nome: 'Livro Microfrontends', preco: 129.9 },
  ];

  adicionar(produto: Produto): void {
    window.dispatchEvent(new CustomEvent('fiap:cart:add', { detail: produto }));
  }
}
