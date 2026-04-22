import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Input de texto com label, helper e mensagem de erro. Suporta ngModel/FormControl. */
@Component({
  selector: 'ui-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInputComponent), multi: true },
  ],
  template: `
    <label class="ui-input">
      @if (label(); as l) {
        <span class="ui-input__label">
          {{ l }}
          @if (required()) { <span class="ui-input__required" aria-hidden="true">*</span> }
        </span>
      }
      <input
        class="ui-input__field"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="error() ? 'true' : null"
        [value]="value()"
        (input)="onInput($any($event.target).value)"
        (blur)="onTouched()"
      />
      @if (error(); as err) {
        <span class="ui-input__error">{{ err }}</span>
      } @else if (helper(); as h) {
        <span class="ui-input__helper">{{ h }}</span>
      }
    </label>
  `,
  styles: [`
    :host { display: block; }
    .ui-input { display: flex; flex-direction: column; gap: var(--fiap-space-1); }
    .ui-input__label { font-family: var(--fiap-font-family); font-size: var(--fiap-font-size-sm); font-weight: var(--fiap-font-weight-medium); color: var(--fiap-color-text-subtle); }
    .ui-input__required { color: var(--fiap-color-danger); margin-left: 2px; }
    .ui-input__field {
      font-family: var(--fiap-font-family);
      font-size: var(--fiap-font-size-md);
      color: var(--fiap-color-text);
      background: var(--fiap-color-surface);
      border: 1px solid var(--fiap-color-border-strong);
      border-radius: var(--fiap-radius-md);
      padding: var(--fiap-space-3) var(--fiap-space-4);
      transition: border-color var(--fiap-duration-fast) var(--fiap-easing);
      width: 100%;
      box-sizing: border-box;
    }
    .ui-input__field:focus {
      outline: none; border-color: var(--fiap-color-brand);
      box-shadow: 0 0 0 3px var(--fiap-color-brand-subtle);
    }
    .ui-input__field[aria-invalid='true'] { border-color: var(--fiap-color-danger); }
    .ui-input__field:disabled { opacity: 0.55; cursor: not-allowed; }
    .ui-input__error { font-size: var(--fiap-font-size-xs); color: var(--fiap-color-danger); }
    .ui-input__helper { font-size: var(--fiap-font-size-xs); color: var(--fiap-color-text-muted); }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly helper = input<string>('');
  readonly error = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel'>('text');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  protected readonly value = signal<string>('');
  private onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  onInput(v: string): void { this.value.set(v); this.onChange(v); }

  writeValue(v: string): void { this.value.set(v ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}
