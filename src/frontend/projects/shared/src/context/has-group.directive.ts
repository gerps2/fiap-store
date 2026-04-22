import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { UserContextService } from './user-context.service';

/**
 * Diretiva estrutural: renderiza o conteúdo apenas se o usuário logado
 * pertencer a ao menos um dos grupos passados.
 *
 * Uso: `<button *hasGroup="'admin'">Admin</button>` ou `*hasGroup="['admin','ops']"`.
 *
 * IMPORTANTE: esta é uma proteção de **UX**, não de **segurança**. O backend
 * continua sendo quem valida via guard + resolver (defense in depth).
 */
@Directive({
  selector: '[hasGroup]',
  standalone: true,
})
export class HasGroupDirective {
  private readonly template = inject(TemplateRef<unknown>);
  private readonly view = inject(ViewContainerRef);
  private readonly ctx = inject(UserContextService);

  readonly hasGroup = input.required<string | string[]>();

  constructor() {
    effect(() => {
      const required = this.hasGroup();
      const groups = Array.isArray(required) ? required : [required];
      const allowed = this.ctx.hasAnyGroup(...groups);
      this.view.clear();
      if (allowed) this.view.createEmbeddedView(this.template);
    });
  }
}
