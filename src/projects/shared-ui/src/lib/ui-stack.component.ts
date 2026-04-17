import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type UiStackDirection = 'row' | 'column';
export type UiStackAlign = 'start' | 'center' | 'end' | 'stretch';
export type UiStackJustify = 'start' | 'center' | 'end' | 'between' | 'around';
export type UiStackGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7';

/** Utilitario de layout — flexbox com gap via token. */
@Component({
  selector: 'ui-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: [`
    :host {
      display: flex;
      flex-direction: var(--ui-stack-direction, column);
      align-items: var(--ui-stack-align, stretch);
      justify-content: var(--ui-stack-justify, flex-start);
      gap: var(--ui-stack-gap, var(--fiap-space-4));
      width: var(--ui-stack-width, auto);
    }
  `],
  host: {
    '[style.--ui-stack-direction]': 'direction()',
    '[style.--ui-stack-align]': "align() === 'center' ? 'center' : align() === 'end' ? 'flex-end' : align() === 'stretch' ? 'stretch' : 'flex-start'",
    '[style.--ui-stack-justify]':
      "justify() === 'center' ? 'center' : justify() === 'end' ? 'flex-end' : justify() === 'between' ? 'space-between' : justify() === 'around' ? 'space-around' : 'flex-start'",
    '[style.--ui-stack-gap]': "'var(--fiap-space-' + gap() + ')'",
    '[style.--ui-stack-width]': 'fullWidth() ? \'100%\' : \'auto\'',
  },
})
export class UiStackComponent {
  readonly direction = input<UiStackDirection>('column');
  readonly align = input<UiStackAlign>('stretch');
  readonly justify = input<UiStackJustify>('start');
  readonly gap = input<UiStackGap>('4');
  readonly fullWidth = input<boolean>(false);
}
