import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import {
  NotificationHubService,
  NotificationsSocketService,
  UiBadgeComponent,
  UiButtonComponent,
  UserContextService,
} from '@fiap/shared';

@Component({
  selector: 'mfe-sino-notificacoes',
  standalone: true,
  imports: [UiBadgeComponent, UiButtonComponent],
  template: `
    <div class="sino">
      <button type="button" class="sino-btn" aria-label="Notificações" (click)="aberto.set(!aberto())">
        <span>🔔</span>
        @if (hub.unreadCount() > 0) {
          <ui-badge class="badge">{{ hub.unreadCount() }}</ui-badge>
        }
      </button>

      @if (aberto()) {
        <div class="painel">
          <header>
            <strong>Notificações</strong>
            <ui-button variant="ghost" size="sm" (click)="hub.resetUnread()">Marcar todas</ui-button>
          </header>
          <ul>
            @for (n of hub.toasts(); track n.id) {
              <li [attr.data-kind]="n.kind"><strong>{{ n.title }}</strong> {{ n.body }}</li>
            } @empty {
              <li>Nenhuma notificação.</li>
            }
          </ul>
        </div>
      }

      @if (hub.ativo(); as toast) {
        <div class="toast" [attr.data-kind]="toast.kind" role="status">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.body }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .sino { position: relative; display: inline-block; }
    .sino-btn { position: relative; border: 0; background: transparent; font-size: 20px; cursor: pointer; padding: 6px 10px; }
    .badge { position: absolute; top: 0; right: 0; }
    .painel { position: absolute; top: 100%; right: 0; z-index: 10; width: 300px; margin-top: 6px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); box-shadow: var(--fiap-shadow-md); }
    .painel header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    .painel ul { list-style: none; margin: 0; padding: 4px 0; max-height: 260px; overflow: auto; }
    .painel li { padding: 8px 12px; font-size: 13px; color: var(--fiap-color-text); }
    .painel li[data-kind='error'] strong { color: var(--fiap-color-brand); }
    .toast { position: fixed; right: 24px; bottom: 24px; z-index: 20; display: flex; flex-direction: column; gap: 2px; max-width: 320px; padding: 12px 16px; border-radius: 8px; background: var(--fiap-color-success); color: var(--fiap-color-on-brand); font-size: 14px; box-shadow: var(--fiap-shadow-md); }
    .toast[data-kind='error'] { background: var(--fiap-color-brand); }
  `],
})
export class SinoNotificacoesComponent {
  protected readonly hub = inject(NotificationHubService);
  protected readonly aberto = signal(false);

  constructor() {
    const ctx = inject(UserContextService);
    const socket = inject(NotificationsSocketService);
    effect(() => (ctx.isAuthenticated() ? socket.connect() : socket.disconnect()));
    inject(DestroyRef).onDestroy(() => socket.disconnect());
  }
}
