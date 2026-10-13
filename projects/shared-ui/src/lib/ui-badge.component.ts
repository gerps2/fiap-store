import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ui-badge" [attr.data-tone]="tone()"><ng-content /></span>`,
  styles: [`
    .ui-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; padding: 1px 5px; border-radius: 999px; background: var(--fiap-color-brand); color: var(--fiap-color-on-brand); font-size: 11px; font-weight: 600; }
    .ui-badge[data-tone='muted'] { background: var(--fiap-color-muted); }
  `],
})
export class UiBadgeComponent {
  readonly tone = input<'brand' | 'muted'>('brand');
}
