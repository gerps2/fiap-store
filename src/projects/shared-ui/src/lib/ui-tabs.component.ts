import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export interface UiTabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

/** Abas horizontais. Emite `tabChange` quando o usuario seleciona. */
@Component({
  selector: 'ui-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-tabs" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          type="button"
          role="tab"
          class="ui-tabs__item"
          [attr.aria-selected]="activeId() === tab.id"
          [attr.aria-disabled]="tab.disabled ? 'true' : null"
          [disabled]="tab.disabled"
          (click)="selecionar(tab)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ui-tabs {
      display: flex; gap: var(--fiap-space-1);
      border-bottom: 1px solid var(--fiap-color-border);
      padding: 0; margin: 0;
    }
    .ui-tabs__item {
      background: transparent; border: 0;
      padding: var(--fiap-space-3) var(--fiap-space-4);
      font-family: var(--fiap-font-family);
      font-size: var(--fiap-font-size-md);
      font-weight: var(--fiap-font-weight-medium);
      color: var(--fiap-color-text-subtle);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color var(--fiap-duration-fast) var(--fiap-easing),
                  border-color var(--fiap-duration-fast) var(--fiap-easing);
    }
    .ui-tabs__item:hover:not(:disabled) { color: var(--fiap-color-text); }
    .ui-tabs__item[aria-selected='true'] {
      color: var(--fiap-color-brand);
      border-bottom-color: var(--fiap-color-brand);
    }
    .ui-tabs__item:disabled { opacity: 0.4; cursor: not-allowed; }
    .ui-tabs__item:focus-visible { outline: 2px solid var(--fiap-color-brand); outline-offset: -2px; }
  `],
})
export class UiTabsComponent {
  readonly tabs = input.required<UiTabItem[]>();
  readonly activeId = input<string>('');
  readonly tabChange = output<UiTabItem>();

  protected selecionar(tab: UiTabItem): void {
    if (tab.disabled) return;
    this.tabChange.emit(tab);
  }
}
