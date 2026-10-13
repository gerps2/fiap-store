import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInputComponent), multi: true }],
  template: `
    <label class="ui-input">
      @if (label()) {
        <span>{{ label() }}</span>
      }
      <input #campo [type]="type()" [value]="valor()" [disabled]="desabilitado()" (input)="aoDigitar(campo.value)" (blur)="aoTocar()" />
    </label>
  `,
  styles: [`
    .ui-input { display: flex; flex-direction: column; gap: var(--fiap-space-1); font-size: var(--fiap-font-size-sm); color: var(--fiap-color-muted); }
    input { padding: var(--fiap-space-2); border: 1px solid var(--fiap-color-border); border-radius: var(--fiap-radius-sm); background: var(--fiap-color-surface); color: var(--fiap-color-text); font-size: var(--fiap-font-size-md); }
    input:focus { outline: none; border-color: var(--fiap-color-brand); }
  `],
})
export class UiInputComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly type = input<'text' | 'email' | 'password'>('text');

  protected readonly valor = signal('');
  protected readonly desabilitado = signal(false);

  private aoMudar: (valor: string) => void = () => {};
  protected aoTocar: () => void = () => {};

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected aoDigitar(valor: string): void {
    this.valor.set(valor);
    this.aoMudar(valor);
  }
}
