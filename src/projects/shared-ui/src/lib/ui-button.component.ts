import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type UiButtonSize = 'sm' | 'md' | 'lg';

/** Botao padrao do design system FIAP. 4 variantes, 3 tamanhos, loading state. */
@Component({
  selector: 'ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [attr.aria-busy]="loading() ? 'true' : null"
      class="ui-btn"
    >
      @if (loading()) { <span class="ui-btn__spinner" aria-hidden="true"></span> }
      <span class="ui-btn__label" [class.ui-btn__label--hidden]="loading()"><ng-content /></span>
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .ui-btn {
      position: relative; display: inline-flex; align-items: center; justify-content: center;
      gap: var(--fiap-space-2); border: 1px solid transparent; border-radius: var(--fiap-radius-md);
      font-family: var(--fiap-font-family); font-weight: var(--fiap-font-weight-semibold);
      line-height: 1; cursor: pointer;
      transition: background var(--fiap-duration-fast) var(--fiap-easing),
        color var(--fiap-duration-fast) var(--fiap-easing),
        border-color var(--fiap-duration-fast) var(--fiap-easing),
        transform var(--fiap-duration-fast) var(--fiap-easing);
    }
    .ui-btn:focus-visible { outline: 2px solid var(--fiap-color-brand); outline-offset: 2px; }
    .ui-btn:active:not(:disabled) { transform: translateY(1px); }
    .ui-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ui-btn[data-size='sm'] { padding: var(--fiap-space-2) var(--fiap-space-3); font-size: var(--fiap-font-size-sm); }
    .ui-btn[data-size='md'] { padding: var(--fiap-space-3) var(--fiap-space-4); font-size: var(--fiap-font-size-md); }
    .ui-btn[data-size='lg'] { padding: var(--fiap-space-4) var(--fiap-space-5); font-size: var(--fiap-font-size-lg); }
    .ui-btn[data-variant='primary'] { background: var(--fiap-color-brand); color: var(--fiap-color-brand-on); }
    .ui-btn[data-variant='primary']:hover:not(:disabled) { background: var(--fiap-color-brand-hover); }
    .ui-btn[data-variant='secondary'] { background: var(--fiap-color-surface); color: var(--fiap-color-text); border-color: var(--fiap-color-border-strong); }
    .ui-btn[data-variant='secondary']:hover:not(:disabled) { background: var(--fiap-color-surface-sunken); }
    .ui-btn[data-variant='ghost'] { background: transparent; color: var(--fiap-color-text); }
    .ui-btn[data-variant='ghost']:hover:not(:disabled) { background: var(--fiap-color-surface-sunken); }
    .ui-btn[data-variant='danger'] { background: var(--fiap-color-danger); color: #fff; }
    .ui-btn[data-variant='danger']:hover:not(:disabled) { filter: brightness(0.95); }
    .ui-btn__label--hidden { opacity: 0; }
    .ui-btn__spinner {
      position: absolute; width: 16px; height: 16px;
      border: 2px solid currentColor; border-right-color: transparent;
      border-radius: 50%; animation: ui-btn-spin 0.7s linear infinite;
    }
    @keyframes ui-btn-spin { to { transform: rotate(360deg); } }
  `],
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
}
