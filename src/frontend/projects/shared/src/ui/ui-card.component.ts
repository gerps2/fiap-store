import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article class="ui-card"><ng-content /></article>`,
  styles: [`
    .ui-card { padding: var(--fiap-space-3); border: 1px solid var(--fiap-color-border); border-radius: var(--fiap-radius-md); background: var(--fiap-color-surface); box-shadow: var(--fiap-shadow-sm); }
  `],
})
export class UiCardComponent {}
