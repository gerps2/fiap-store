import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CREATE_PRODUCT, LIST_PRODUCTS, UiButtonComponent, UiCardComponent, UiInputComponent } from '@fiap/shared';
import { Apollo } from 'apollo-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [FormsModule, UiButtonComponent, UiCardComponent, UiInputComponent],
  template: `
    <ui-card class="novo">
      <h2>Criar produto</h2>
      <form (ngSubmit)="criar()" #form="ngForm">
        <ui-input label="SKU" name="sku" [(ngModel)]="sku" required />
        <ui-input label="Nome" name="name" [(ngModel)]="name" required />
        <ui-input label="Preço em centavos" name="priceCents" [(ngModel)]="priceCents" required />
        <ui-button type="submit" [disabled]="!form.valid">Criar</ui-button>
      </form>
      @if (mensagem()) {
        <p>{{ mensagem() }}</p>
      }
    </ui-card>
  `,
  styles: [`
    .novo { display: block; max-width: 420px; margin: 0 auto; }
    h2 { margin: 0 0 12px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    p { margin: 12px 0 0; color: var(--fiap-color-muted); font-size: var(--fiap-font-size-sm); }
  `],
})
export class NewProductPage {
  private readonly apollo = inject(Apollo);

  protected readonly mensagem = signal('');
  protected sku = '';
  protected name = '';
  protected priceCents = '';

  protected async criar(): Promise<void> {
    try {
      await firstValueFrom(
        this.apollo.mutate({
          mutation: CREATE_PRODUCT,
          variables: {
            input: {
              sku: this.sku,
              name: this.name,
              description: this.name,
              priceCents: Number(this.priceCents),
              categorySlug: 'canecas',
            },
          },
          refetchQueries: [{ query: LIST_PRODUCTS }],
        }),
      );
      this.mensagem.set(`Produto ${this.sku} criado.`);
    } catch (erro) {
      this.mensagem.set(erro instanceof Error ? erro.message : 'Falha ao criar o produto.');
    }
  }
}
