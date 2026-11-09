import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost';
export type UiButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="ui-btn" [type]="type()" [disabled]="disabled()" [attr.data-variant]="variant()" [attr.data-size]="size()">
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: inline-block; }
    .ui-btn { border: 1px solid transparent; border-radius: var(--fiap-radius-sm); font-family: var(--fiap-font-family); font-weight: 600; cursor: pointer; transition: filter var(--fiap-motion-fast) var(--fiap-motion-ease); }
    .ui-btn[data-size='sm'] { padding: var(--fiap-space-1) var(--fiap-space-2); font-size: var(--fiap-font-size-sm); }
    .ui-btn[data-size='md'] { padding: var(--fiap-space-2) var(--fiap-space-3); font-size: var(--fiap-font-size-md); }
    .ui-btn[data-size='lg'] { padding: var(--fiap-space-3) var(--fiap-space-4); font-size: var(--fiap-font-size-lg); }
    .ui-btn[data-variant='primary'] { background: var(--fiap-color-brand); color: var(--fiap-color-on-brand); }
    .ui-btn[data-variant='secondary'] { background: var(--fiap-color-surface); color: var(--fiap-color-text); border-color: var(--fiap-color-border); }
    .ui-btn[data-variant='ghost'] { background: transparent; color: var(--fiap-color-brand); }
    .ui-btn:hover:not(:disabled) { filter: brightness(1.08); }
    .ui-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class UiButtonComponent {
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
}
