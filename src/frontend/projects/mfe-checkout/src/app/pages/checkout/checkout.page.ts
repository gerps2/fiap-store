import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostBinding,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Apollo, QueryRef } from 'apollo-angular';
import { CHECKOUT, MY_CART, type CartDto, type OrderDto } from '@fiap/shared';

type FormaPagamento = 'cartao' | 'pix' | 'boleto';

interface ItemResumo {
  nome: string;
  qty: number;
  preco: number;
}

/** Checkout consumindo myCart via Apollo + mutation checkout. */
@Component({
  selector: 'mfe-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [FormsModule, RouterLink],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.css'],
})
export class CheckoutComponent {
  @HostBinding('class.mfe-boundary') readonly _boundary = true;
  @HostBinding('attr.data-mfe') readonly _mfe = 'mfe-checkout';

  private readonly apollo = inject(Apollo);

  protected readonly nome = signal('');
  protected readonly email = signal('');
  protected readonly cep = signal('');
  protected readonly logradouro = signal('');
  protected readonly numero = signal('');
  protected readonly complemento = signal('');
  protected readonly bairro = signal('');
  protected readonly cidade = signal('');
  protected readonly uf = signal('SP');
  protected readonly formaPagamento = signal<FormaPagamento>('cartao');
  protected readonly numeroCartao = signal('');
  protected readonly validade = signal('');
  protected readonly cvv = signal('');
  protected readonly nomeImpresso = signal('');
  protected readonly confirmado = signal(false);
  protected readonly numeroPedido = signal('');
  protected readonly erroCheckout = signal<string | null>(null);
  protected readonly processando = signal(false);

  protected readonly itens = signal<ItemResumo[]>([]);
  private cartRef!: QueryRef<{ myCart: CartDto }>;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.cartRef = this.apollo.watchQuery<{ myCart: CartDto }>({
      query: MY_CART,
      fetchPolicy: 'cache-and-network',
    });
    const sub = this.cartRef.valueChanges.subscribe((r) => {
      const items = (r.data?.myCart?.items ?? []) as CartDto['items'];
      this.itens.set(
        items.map<ItemResumo>((it) => ({
          nome: it.product.name,
          qty: it.quantity,
          preco: (it.product.priceCents * it.quantity) / 100,
        })),
      );
    });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected readonly subtotal = computed<number>(() =>
    this.itens().reduce<number>((acc, it) => acc + it.preco, 0),
  );

  protected readonly opcoesPagamento: { id: FormaPagamento; label: string; badge?: string }[] = [
    { id: 'cartao', label: 'Cartão de crédito' },
    { id: 'pix', label: 'Pix', badge: '5% off' },
    { id: 'boleto', label: 'Boleto' },
  ];

  protected readonly formValido = computed(
    () => !!this.nome() && !!this.email() && this.cep().length >= 8 && this.itens().length > 0,
  );

  protected readonly totalFinal = computed(() => {
    const base = this.subtotal();
    return this.formaPagamento() === 'pix' ? base * 0.95 : base;
  });

  /** Dispara mutation checkout; em sucesso, exibe confirmação e limpa cache do cart. */
  protected async finalizar(): Promise<void> {
    if (!this.formValido() || this.processando()) return;
    this.processando.set(true);
    this.erroCheckout.set(null);
    try {
      const res = await this.apollo.mutate<{ checkout: OrderDto }>({
        mutation: CHECKOUT,
        refetchQueries: ['MyCart'],
      }).toPromise();
      const order = res?.data?.checkout;
      if (!order) throw new Error('Resposta do checkout vazia.');
      this.numeroPedido.set(order.id.slice(0, 8));
      this.confirmado.set(true);
    } catch (err: unknown) {
      const e = err as { message?: string; graphQLErrors?: { message: string }[] };
      const msg = e?.graphQLErrors?.[0]?.message ?? e?.message ?? 'Falha ao processar checkout.';
      this.erroCheckout.set(msg);
    } finally {
      this.processando.set(false);
    }
  }

  protected verPedidos(): void {
    console.log('[mfe-checkout] ver pedidos');
  }

  protected anyVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
