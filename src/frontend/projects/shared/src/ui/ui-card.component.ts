import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiCardVariant = 'flat' | 'elevated' | 'outlined';

/** Container com header/body/footer via ng-content slots. */
@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="ui-card" [attr.data-variant]="variant()" [attr.data-padding]="padding()">
      <header class="ui-card__header"><ng-content select="[card-header]" /></header>
      <div class="ui-card__body"><ng-content /></div>
      <footer class="ui-card__footer"><ng-content select="[card-footer]" /></footer>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .ui-card {
      background: var(--fiap-color-surface-raised);
      border-radius: var(--fiap-radius-lg);
      overflow: hidden;
      color: var(--fiap-color-text);
      display: flex; flex-direction: column;
    }
    .ui-card[data-variant='flat'] { border: 1px solid var(--fiap-color-border); }
    .ui-card[data-variant='elevated'] { box-shadow: var(--fiap-shadow-md); }
    .ui-card[data-variant='outlined'] { border: 1px solid var(--fiap-color-border-strong); }

    .ui-card__header:empty, .ui-card__footer:empty { display: none; }
    .ui-card__header { padding: var(--fiap-space-5) var(--fiap-space-5) 0; }
    .ui-card__footer { padding: 0 var(--fiap-space-5) var(--fiap-space-5); margin-top: auto; }
    .ui-card__body { padding: var(--fiap-space-5); flex: 1; }

    .ui-card[data-padding='sm'] .ui-card__header { padding: var(--fiap-space-3) var(--fiap-space-3) 0; }
    .ui-card[data-padding='sm'] .ui-card__body { padding: var(--fiap-space-3); }
    .ui-card[data-padding='sm'] .ui-card__footer { padding: 0 var(--fiap-space-3) var(--fiap-space-3); }

    .ui-card[data-padding='lg'] .ui-card__header { padding: var(--fiap-space-6) var(--fiap-space-6) 0; }
    .ui-card[data-padding='lg'] .ui-card__body { padding: var(--fiap-space-6); }
    .ui-card[data-padding='lg'] .ui-card__footer { padding: 0 var(--fiap-space-6) var(--fiap-space-6); }
  `],
})
export class UiCardComponent {
  readonly variant = input<UiCardVariant>('elevated');
  readonly padding = input<'sm' | 'md' | 'lg'>('md');
}
