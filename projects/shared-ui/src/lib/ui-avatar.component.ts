import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ui-avatar" [attr.aria-label]="nome()">{{ iniciais() }}</span>`,
  styles: [`
    .ui-avatar { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 999px; background: var(--fiap-color-brand); color: var(--fiap-color-on-brand); font-size: var(--fiap-font-size-sm); font-weight: 600; }
  `],
})
export class UiAvatarComponent {
  readonly nome = input.required<string>();
  readonly iniciais = computed(() =>
    this.nome().split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase(),
  );
}
