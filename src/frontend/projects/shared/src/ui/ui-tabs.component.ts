import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export interface UiTab {
  id: string;
  label: string;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="ui-tabs" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button type="button" role="tab" [class.ativa]="tab.id === ativa()" (click)="selecionar(tab.id)">{{ tab.label }}</button>
      }
    </nav>
    <ng-content />
  `,
  styles: [`
    .ui-tabs { display: flex; gap: var(--fiap-space-3); margin-bottom: var(--fiap-space-3); border-bottom: 1px solid var(--fiap-color-border); }
    button { padding: var(--fiap-space-2) 0; border: 0; border-bottom: 2px solid transparent; background: transparent; color: var(--fiap-color-muted); font-size: var(--fiap-font-size-md); cursor: pointer; }
    button.ativa { color: var(--fiap-color-brand); border-bottom-color: var(--fiap-color-brand); font-weight: 600; }
  `],
})
export class UiTabsComponent {
  readonly tabs = input.required<UiTab[]>();
  readonly tabChange = output<string>();
  protected readonly ativa = signal('');

  protected selecionar(id: string): void {
    this.ativa.set(id);
    this.tabChange.emit(id);
  }
}
