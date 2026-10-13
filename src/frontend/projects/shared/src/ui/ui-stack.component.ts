import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ui-stack" [style.flex-direction]="direction()" [style.gap]="gap()"><ng-content /></div>`,
  styles: [`
    .ui-stack { display: flex; }
  `],
})
export class UiStackComponent {
  readonly direction = input<'row' | 'column'>('column');
  readonly gap = input('var(--fiap-space-3)');
}
