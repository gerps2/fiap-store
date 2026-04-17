import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Loading spinner — 3 tamanhos, herda cor do contexto. */
@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ui-spinner" [attr.data-size]="size()" role="status" [attr.aria-label]="label()">
      <span class="ui-spinner__ring"></span>
    </span>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; }
    .ui-spinner { display: inline-block; }
    .ui-spinner__ring {
      display: block;
      border-style: solid;
      border-color: currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: ui-spin 0.8s linear infinite;
      color: var(--fiap-color-brand);
    }
    .ui-spinner[data-size='sm'] .ui-spinner__ring { width: 14px; height: 14px; border-width: 2px; }
    .ui-spinner[data-size='md'] .ui-spinner__ring { width: 22px; height: 22px; border-width: 2.5px; }
    .ui-spinner[data-size='lg'] .ui-spinner__ring { width: 36px; height: 36px; border-width: 3px; }
    @keyframes ui-spin { to { transform: rotate(360deg); } }
  `],
})
export class UiSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input<string>('Carregando');
}
