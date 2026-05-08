import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostBinding,
  HostListener,
  Input,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  MY_CART,
  UPDATE_CART_ITEM,
  REMOVE_FROM_CART,
  type CartDto,
} from '@fiap/shared';

type ItemIcon = 'shirt' | 'cup' | 'book' | 'laptop';

interface ItemCarrinho {
  readonly id: string;
  readonly nome: string;
  readonly categoria: string;
  readonly preco: number;
  readonly quantidade: number;
  readonly icon: ItemIcon;
}

function iconeDe(sku: string): ItemIcon {
  const s = sku.toLowerCase();
  if (s.startsWith('liv')) return 'book';
  if (s.startsWith('cam')) return 'shirt';
  if (s.startsWith('can')) return 'cup';
  return 'laptop';
}

/** Carrinho drawer slide-in consumindo myCart via Apollo e mutations para update/remove. */
@Component({
  selector: 'mfe-carrinho',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.css'],
})
export class CarrinhoComponent {
  @HostBinding('class.mfe-boundary') readonly _boundary = true;
  @HostBinding('attr.data-mfe') readonly _mfe = 'mfe-carrinho';

  /** Quando true, renderiza como sidebar fixa (sem trigger, sem overlay, sem backdrop). */
  @Input() embedded = false;
  @HostBinding('class.is-embedded') get _embedded() { return this.embedded; }

  private readonly router = inject(Router);
  private readonly apollo = inject(Apollo);

  protected readonly aberto = signal(false);

  protected readonly itens = signal<ItemCarrinho[]>([]);
  private queryRef!: QueryRef<{ myCart: CartDto }>;

  protected readonly quantidadeTotal = computed(() =>
    this.itens().reduce((acc, i) => acc + i.quantidade, 0),
  );

  protected readonly subtotal = computed(() =>
    this.itens().reduce((acc, i) => acc + i.quantidade * i.preco, 0),
  );

  protected readonly frete = computed(() => (this.subtotal() > 150 ? 0 : 19.9));
  protected readonly total = computed(() => this.subtotal() + this.frete());

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.queryRef = this.apollo.watchQuery<{ myCart: CartDto }>({
      query: MY_CART,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    });
    const sub = this.queryRef.valueChanges.subscribe((r) => {
      const items = (r.data?.myCart?.items ?? []) as CartDto['items'];
      this.itens.set(
        items.map<ItemCarrinho>((it) => ({
          id: it.id,
          nome: it.product.name,
          categoria: it.product.sku,
          preco: it.product.priceCents / 100,
          quantidade: it.quantity,
          icon: iconeDe(it.product.sku),
        })),
      );
    });
    destroyRef.onDestroy(() => sub.unsubscribe());

    effect(() => {
      const url = this.router.url;
      if (url.startsWith('/carrinho') || this.embedded) this.aberto.set(true);
    });

    const handler = (_ev: Event): void => {
      this.queryRef.refetch();
      this.aberto.set(true);
    };
    window.addEventListener('fiap:cart:updated', handler as EventListener);
    destroyRef.onDestroy(() => {
      window.removeEventListener('fiap:cart:updated', handler as EventListener);
    });
  }

  /** Abre o drawer. */
  protected abrir(): void { this.aberto.set(true); }

  /** Fecha o drawer. */
  protected fechar(): void { this.aberto.set(false); }

  /** Incrementa quantidade do item pelo id. */
  protected async incrementar(id: string): Promise<void> {
    const item = this.itens().find((i) => i.id === id);
    if (!item) return;
    await this.mutateQuantity(id, item.quantidade + 1);
  }

  /** Decrementa quantidade; backend remove se chegar a 0. */
  protected async decrementar(id: string): Promise<void> {
    const item = this.itens().find((i) => i.id === id);
    if (!item) return;
    await this.mutateQuantity(id, item.quantidade - 1);
  }

  /** Remove item pelo id. */
  protected async remover(id: string): Promise<void> {
    await this.apollo.mutate<{ removeFromCart: CartDto }>({
      mutation: REMOVE_FROM_CART,
      variables: { itemId: id },
      refetchQueries: ['MyCart'],
    }).toPromise();
  }

  private async mutateQuantity(itemId: string, quantity: number): Promise<void> {
    await this.apollo.mutate<{ updateCartItem: CartDto }>({
      mutation: UPDATE_CART_ITEM,
      variables: { itemId, quantity },
      refetchQueries: ['MyCart'],
    }).toPromise();
  }

  /** Fecha com ESC. */
  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    if (this.aberto()) this.fechar();
  }
}
