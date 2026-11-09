import { Component, inject } from '@angular/core';
import { NotificationHubService } from '@fiap/shared';

@Component({
  selector: 'mfe-notificacoes-lista',
  standalone: true,
  template: `
    <ul>
      @for (n of hub.toasts(); track n.id) {
        <li [attr.data-kind]="n.kind">
          <strong>{{ n.title }}</strong>
          <span>{{ n.body }}</span>
        </li>
      } @empty {
        <li>Nenhuma notificação nesta sessão.</li>
      }
    </ul>
  `,
  styles: [`
    ul { list-style: none; margin: 0; padding: 0; }
    li { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    li span { color: var(--fiap-color-muted); font-size: 12px; }
    li[data-kind='error'] strong { color: var(--fiap-color-brand); }
  `],
})
export class NotificacoesListaComponent {
  protected readonly hub = inject(NotificationHubService);
}
