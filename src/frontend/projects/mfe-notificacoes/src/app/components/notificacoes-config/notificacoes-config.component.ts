import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Configurações de canais de notificação do usuário. */
@Component({
  selector: 'mfe-notificacoes-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <form class="form" (submit)="$event.preventDefault()">
      <h3 class="titulo-form">Preferências de entrega</h3>

      <label class="opcao">
        <input type="checkbox" [(ngModel)]="email" name="email" />
        <div class="descricao">
          <strong>Receber por e-mail</strong>
          <span>Resumos diários e confirmações importantes.</span>
        </div>
      </label>

      <label class="opcao">
        <input type="checkbox" [(ngModel)]="push" name="push" />
        <div class="descricao">
          <strong>Notificações push no navegador</strong>
          <span>Alertas em tempo real enquanto você navega.</span>
        </div>
      </label>

      <p class="status">
        Sincronizado localmente · Email
        <em>{{ email() ? 'ativado' : 'desativado' }}</em>
        · Push
        <em>{{ push() ? 'ativado' : 'desativado' }}</em>
      </p>
    </form>
  `,
  styles: [`
    :host { display: block; font-family: var(--font-body); }
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--fiap-white);
      border: 1px solid var(--fiap-color-border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .titulo-form {
      margin: 0;
      font-family: var(--font-heading);
      font-weight: var(--weight-semibold);
      font-size: var(--text-base);
      color: var(--fiap-dark);
    }
    .opcao {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 1px solid var(--fiap-color-border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: var(--transition-base);
    }
    .opcao:hover { border-color: var(--fiap-color-border); background: var(--fiap-surface); }
    .opcao input[type="checkbox"] {
      accent-color: var(--fiap-red);
      width: 18px;
      height: 18px;
      margin-top: 2px;
    }
    .descricao { display: flex; flex-direction: column; gap: 2px; }
    .descricao strong {
      font-family: var(--font-heading);
      font-weight: var(--weight-semibold);
      font-size: var(--text-sm);
      color: var(--fiap-dark);
    }
    .descricao span {
      font-size: var(--text-xs);
      color: var(--fiap-color-text-subtle);
    }
    .status {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--fiap-color-text-subtle);
    }
    .status em {
      font-style: normal;
      font-weight: var(--weight-semibold);
      color: var(--fiap-dark);
    }
  `],
})
export class NotificacoesConfigComponent {
  protected readonly email = signal(true);
  protected readonly push = signal(false);
}
