import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Estado vazio — usado tanto para "lista vazia" quanto para fallback de erro
 * quando um remote falha em carregar (via UiRemoteOutlet).
 */
@Component({
  selector: 'ui-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-empty" [attr.data-tone]="tone()" role="status">
      <div class="ui-empty__icon" aria-hidden="true">
        <ng-content select="[empty-icon]" />
        @if (!hasIcon) {
          <span class="ui-empty__default-icon">{{ defaultIcon() }}</span>
        }
      </div>
      <h3 class="ui-empty__title">{{ title() }}</h3>
      @if (description(); as d) {
        <p class="ui-empty__description">{{ d }}</p>
      }
      <div class="ui-empty__actions">
        <ng-content select="[empty-actions]" />
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ui-empty {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      gap: var(--fiap-space-3);
      padding: var(--fiap-space-7) var(--fiap-space-5);
      border-radius: var(--fiap-radius-lg);
      background: var(--fiap-color-surface-alt);
      color: var(--fiap-color-text);
    }
    .ui-empty[data-tone='danger'] { background: var(--fiap-color-danger-subtle); color: var(--fiap-color-danger); }
    .ui-empty[data-tone='warning'] { background: var(--fiap-color-warning-subtle); color: var(--fiap-color-warning); }
    .ui-empty__icon { font-size: 40px; line-height: 1; }
    .ui-empty__default-icon { display: inline-block; }
    .ui-empty__title {
      margin: 0; font-family: var(--fiap-font-family);
      font-size: var(--fiap-font-size-xl); font-weight: var(--fiap-font-weight-semibold);
      color: var(--fiap-color-text);
    }
    .ui-empty[data-tone='danger'] .ui-empty__title { color: var(--fiap-color-danger); }
    .ui-empty__description {
      margin: 0; max-width: 52ch;
      font-size: var(--fiap-font-size-md); color: var(--fiap-color-text-subtle);
      line-height: var(--fiap-line-height-normal);
    }
    .ui-empty__actions { margin-top: var(--fiap-space-3); display: flex; gap: var(--fiap-space-3); }
    .ui-empty__actions:empty { display: none; }
  `],
})
export class UiEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly defaultIcon = input<string>('○');
  readonly tone = input<'neutral' | 'danger' | 'warning'>('neutral');
  protected readonly hasIcon = false;
}
