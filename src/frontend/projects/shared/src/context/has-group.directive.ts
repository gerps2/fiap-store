import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { UserContextService } from './user-context.service';

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
      const exigido = this.hasGroup();
      const grupos = Array.isArray(exigido) ? exigido : [exigido];
      this.view.clear();
      if (this.ctx.hasAnyGroup(...grupos)) {
        this.view.createEmbeddedView(this.template);
      }
    });
  }
}
