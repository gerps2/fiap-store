import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { UiButtonComponent } from './ui-button.component';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiButtonComponent],
  template: `
    <div class="ui-empty">
      <strong>{{ title() }}</strong>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      @if (action()) {
        <ui-button variant="secondary" size="sm" (click)="actionClick.emit()">{{ action() }}</ui-button>
      }
    </div>
  `,
  styles: [`
    .ui-empty { display: flex; flex-direction: column; align-items: center; gap: var(--fiap-space-2); padding: var(--fiap-space-4); border: 1px dashed var(--fiap-color-border); border-radius: var(--fiap-radius-md); color: var(--fiap-color-text); text-align: center; }
    p { margin: 0; color: var(--fiap-color-muted); font-size: var(--fiap-font-size-sm); }
  `],
})
export class UiEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly action = input('');
  readonly actionClick = output<void>();
}
