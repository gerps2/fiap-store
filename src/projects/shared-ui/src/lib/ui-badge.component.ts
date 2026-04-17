import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiBadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

/** Etiqueta pequena — badge de contador, tag de status, selo. */
@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ui-badge" [attr.data-tone]="tone()" [attr.data-dot]="dot() ? '' : null"><ng-content /></span>`,
  styles: [`
    :host { display: inline-block; }
    .ui-badge {
      display: inline-flex; align-items: center; gap: var(--fiap-space-1);
      padding: 2px var(--fiap-space-2);
      border-radius: var(--fiap-radius-full);
      font-family: var(--fiap-font-family);
      font-size: var(--fiap-font-size-xs);
      font-weight: var(--fiap-font-weight-semibold);
      line-height: 1.4;
      white-space: nowrap;
    }
    .ui-badge[data-dot]::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: currentColor;
    }
    .ui-badge[data-tone='neutral']  { background: var(--fiap-color-surface-sunken); color: var(--fiap-color-text-subtle); }
    .ui-badge[data-tone='brand']    { background: var(--fiap-color-brand); color: var(--fiap-color-brand-on); }
    .ui-badge[data-tone='success']  { background: var(--fiap-color-success-subtle); color: var(--fiap-color-success); }
    .ui-badge[data-tone='warning']  { background: var(--fiap-color-warning-subtle); color: var(--fiap-color-warning); }
    .ui-badge[data-tone='danger']   { background: var(--fiap-color-danger-subtle); color: var(--fiap-color-danger); }
    .ui-badge[data-tone='info']     { background: var(--fiap-color-info-subtle); color: var(--fiap-color-info); }
  `],
})
export class UiBadgeComponent {
  readonly tone = input<UiBadgeTone>('neutral');
  readonly dot = input<boolean>(false);
}
