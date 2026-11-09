import { Component, signal } from '@angular/core';

@Component({
  selector: 'mfe-notificacoes-config',
  standalone: true,
  template: `
    <label>
      <input type="checkbox" [checked]="porEmail()" (change)="porEmail.set(!porEmail())" />
      Receber por e-mail
    </label>
    <label>
      <input type="checkbox" [checked]="porPush()" (change)="porPush.set(!porPush())" />
      Receber notificações push
    </label>
    <p>E-mail: {{ porEmail() ? 'ligado' : 'desligado' }} · Push: {{ porPush() ? 'ligado' : 'desligado' }}</p>
  `,
  styles: [`
    label { display: block; padding: 8px 0; font-size: 14px; }
    p { margin: 12px 0 0; color: var(--fiap-color-muted); font-size: 12px; }
  `],
})
export class NotificacoesConfigComponent {
  protected readonly porEmail = signal(true);
  protected readonly porPush = signal(false);
}
