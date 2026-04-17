import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Avatar circular — mostra iniciais ou imagem. */
@Component({
  selector: 'ui-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="ui-avatar" [attr.data-size]="size()" [attr.aria-label]="name()">
      @if (imageUrl(); as url) {
        <img [src]="url" [alt]="name()" />
      } @else {
        <span class="ui-avatar__initials">{{ iniciais() }}</span>
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .ui-avatar {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: var(--fiap-color-brand-subtle);
      color: var(--fiap-color-brand);
      font-family: var(--fiap-font-family);
      font-weight: var(--fiap-font-weight-semibold);
      overflow: hidden;
      user-select: none;
    }
    .ui-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .ui-avatar[data-size='sm'] { width: 28px; height: 28px; font-size: 11px; }
    .ui-avatar[data-size='md'] { width: 36px; height: 36px; font-size: 13px; }
    .ui-avatar[data-size='lg'] { width: 48px; height: 48px; font-size: 16px; }
  `],
})
export class UiAvatarComponent {
  readonly name = input<string>('');
  readonly imageUrl = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly iniciais = computed(() => {
    const n = this.name().trim();
    if (!n) return '?';
    const partes = n.split(/\s+/).filter(Boolean);
    const a = partes[0]?.[0] ?? '';
    const b = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (a + b).toUpperCase();
  });
}
