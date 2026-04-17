import { ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type FormaPagamento = 'cartao' | 'pix' | 'boleto';

/** Checkout premium com form de endereço/pagamento e resumo lateral. */
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
  protected readonly numeroPedido = signal(0);

  protected readonly subtotal = 349.60;

  protected readonly itens = [
    { nome: 'Camiseta FIAP', qty: 2, preco: 179.80, icon: '👕', grad: 'linear-gradient(135deg, #ED145B 0%, #B31048 100%)' },
    { nome: 'Caneca FIAP', qty: 1, preco: 39.90, icon: '☕', grad: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)' },
    { nome: 'Livro Angular', qty: 1, preco: 129.90, icon: '📘', grad: 'linear-gradient(135deg, #ED145B 0%, #1A1A1A 100%)' },
  ];

  protected readonly opcoesPagamento: { id: FormaPagamento; label: string; badge?: string }[] = [
    { id: 'cartao', label: 'Cartão de crédito' },
    { id: 'pix', label: 'Pix', badge: '5% off' },
    { id: 'boleto', label: 'Boleto' },
  ];

  protected readonly formValido = computed(() => !!this.nome() && !!this.email() && this.cep().length >= 8);

  protected readonly totalFinal = computed(() => {
    const base = this.subtotal;
    return this.formaPagamento() === 'pix' ? base * 0.95 : base;
  });

  protected finalizar(): void {
    if (!this.formValido()) return;
    this.numeroPedido.set(Math.floor(Math.random() * 100000));
    this.confirmado.set(true);
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
