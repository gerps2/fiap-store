import { Component, inject } from '@angular/core';
import { UiButtonComponent } from '@fiap/shared';
import { NotificacoesService } from '../../services/notificacoes.service';

@Component({
  selector: 'mfe-notificacoes-lista',
  standalone: true,
  imports: [UiButtonComponent],
  template: `
    <ul>
      @for (n of servico.itens(); track n.id) {
        <li [class.lida]="n.lida">
          <span>{{ n.titulo }}</span>
          @if (!n.lida) {
            <ui-button variant="secondary" size="sm" (click)="servico.marcarComoLida(n.id)">Marcar como lida</ui-button>
          }
        </li>
      }
    </ul>
  `,
  styles: [`
    ul { list-style: none; margin: 0; padding: 0; }
    li { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    li.lida span { color: var(--fiap-color-muted); text-decoration: line-through; }
  `],
})
export class NotificacoesListaComponent {
  protected readonly servico = inject(NotificacoesService);
}
