import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ui-topbar">
      <ng-content select="[slot=brand]" />
      <ng-content select="[slot=nav]" />
      <ng-content select="[slot=actions]" />
    </header>
  `,
  styles: [`
    .ui-topbar { display: flex; align-items: center; justify-content: space-between; padding: var(--fiap-space-3) var(--fiap-space-4); border-bottom: 2px solid var(--fiap-color-brand); background: var(--fiap-color-surface); }
  `],
})
export class UiTopbarComponent {}
