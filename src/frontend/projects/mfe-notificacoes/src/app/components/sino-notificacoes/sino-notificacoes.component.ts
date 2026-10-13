import { Component, inject, signal } from '@angular/core';
import { UiBadgeComponent, UiButtonComponent } from '@fiap/shared';
import { NotificacoesService } from '../../services/notificacoes.service';

@Component({
  selector: 'mfe-sino-notificacoes',
  standalone: true,
  imports: [UiBadgeComponent, UiButtonComponent],
  template: `
    <div class="sino">
      <button type="button" class="sino-btn" aria-label="Notificações" (click)="aberto.set(!aberto())">
        <span>🔔</span>
        @if (servico.naoLidas() > 0) {
          <ui-badge class="badge">{{ servico.naoLidas() }}</ui-badge>
        }
      </button>

      @if (aberto()) {
        <div class="painel">
          <header>
            <strong>Notificações</strong>
            <ui-button variant="ghost" size="sm" (click)="servico.marcarTodasComoLidas()">Marcar todas</ui-button>
          </header>
          <ul>
            @for (n of servico.itens(); track n.id) {
              <li [class.lida]="n.lida" (click)="servico.marcarComoLida(n.id)">{{ n.titulo }}</li>
            }
          </ul>
        </div>
      }

      @if (servico.toast(); as mensagem) {
        <div class="toast" role="status">{{ mensagem }}</div>
      }
    </div>
  `,
  styles: [`
    .sino { position: relative; display: inline-block; }
    .sino-btn { position: relative; border: 0; background: transparent; font-size: 20px; cursor: pointer; padding: 6px 10px; }
    .badge { position: absolute; top: 0; right: 0; }
    .painel { position: absolute; top: 100%; right: 0; z-index: 10; width: 280px; margin-top: 6px; border: 1px solid var(--fiap-color-border); border-radius: 8px; background: var(--fiap-color-surface); box-shadow: var(--fiap-shadow-md); }
    .painel header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--fiap-color-border); font-size: 14px; }
    .painel ul { list-style: none; margin: 0; padding: 4px 0; }
    .painel li { padding: 8px 12px; font-size: 13px; color: var(--fiap-color-text); cursor: pointer; }
    .painel li:hover { background: var(--fiap-color-surface-alt); }
    .painel li.lida { color: var(--fiap-color-muted); text-decoration: line-through; }
    .toast { position: fixed; right: 24px; bottom: 24px; z-index: 20; padding: 12px 16px; border-radius: 8px; background: var(--fiap-color-success); color: var(--fiap-color-on-brand); font-size: 14px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16); }
  `],
})
export class SinoNotificacoesComponent {
  protected readonly servico = inject(NotificacoesService);
  protected readonly aberto = signal(false);
}
