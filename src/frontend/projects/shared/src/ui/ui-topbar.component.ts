import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Shell de topbar do host — 3 slots nomeados: [brand], [nav], [actions].
 * Respeita a altura do token --fiap-topbar-height.
 */
@Component({
  selector: 'ui-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ui-topbar">
      <div class="ui-topbar__inner">
        <div class="ui-topbar__brand"><ng-content select="[brand]" /></div>
        <nav class="ui-topbar__nav"><ng-content select="[nav]" /></nav>
        <div class="ui-topbar__actions"><ng-content select="[actions]" /></div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; position: sticky; top: 0; z-index: 50; }
    .ui-topbar {
      height: var(--fiap-topbar-height, 64px);
      background: var(--fiap-color-surface-raised);
      border-bottom: 1px solid var(--fiap-color-border);
      backdrop-filter: saturate(1.1);
    }
    .ui-topbar__inner {
      max-width: var(--fiap-container-max, 1280px);
      margin: 0 auto;
      height: 100%;
      padding: 0 var(--fiap-space-5);
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--fiap-space-5);
    }
    .ui-topbar__brand { display: flex; align-items: center; gap: var(--fiap-space-2); }
    .ui-topbar__nav { display: flex; align-items: center; gap: var(--fiap-space-2); }
    .ui-topbar__actions { display: flex; align-items: center; gap: var(--fiap-space-3); justify-self: end; }
  `],
})
export class UiTopbarComponent {}
