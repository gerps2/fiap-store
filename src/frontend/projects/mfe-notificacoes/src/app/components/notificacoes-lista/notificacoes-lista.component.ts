import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificacoesService } from '../../services/notificacoes.service';

/** Lista detalhada de notificações com ações individuais. */
@Component({
  selector: 'mfe-notificacoes-lista',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <ul class="lista">
      @for (n of servico.itens(); track n.id) {
        <li class="item" [class.item--lida]="n.lida">
          <div class="info">
            <span class="status" [class.status--lida]="n.lida" aria-hidden="true"></span>
            <strong class="titulo">{{ n.titulo }}</strong>
          </div>
          <button
            type="button"
            class="fiap-btn-ghost acao"
            (click)="servico.marcarComoLida(n.id)"
            [disabled]="n.lida"
          >
            {{ n.lida ? 'Lida' : 'Marcar como lida' }}
          </button>
        </li>
      }
    </ul>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-body); }
    .lista { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--fiap-white);
      border: 1px solid var(--fiap-color-border-subtle);
      border-radius: var(--radius-md);
      transition: var(--transition-base);
    }
    .item:hover { border-color: var(--fiap-color-border); box-shadow: var(--shadow-sm); }
    .info { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
    .status {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--fiap-red);
      box-shadow: 0 0 0 3px var(--fiap-red-soft);
      flex-shrink: 0;
    }
    .status--lida { background: var(--fiap-color-border); box-shadow: none; }
    .titulo {
      font-family: var(--font-heading);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      color: var(--fiap-dark);
    }
    .item--lida .titulo { color: var(--fiap-color-text-subtle); font-weight: var(--weight-medium); }
    .acao { font-size: var(--text-xs); padding: var(--space-2) var(--space-3); }
    .acao:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class NotificacoesListaComponent {
  protected readonly servico = inject(NotificacoesService);
}
