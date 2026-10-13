import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ui-spinner" role="status" aria-label="Carregando"></span>`,
  styles: [`
    .ui-spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid var(--fiap-color-border); border-top-color: var(--fiap-color-brand); border-radius: 50%; animation: ui-spin 0.8s linear infinite; }
    @keyframes ui-spin { to { transform: rotate(360deg); } }
  `],
})
export class UiSpinnerComponent {}
