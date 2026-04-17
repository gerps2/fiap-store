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

type ItemIcon = 'shirt' | 'cup' | 'book' | 'laptop';

interface ItemCarrinho {
  readonly id: string;
  readonly nome: string;
  readonly categoria: string;
  readonly preco: number;
  readonly quantidade: number;
  readonly icon: ItemIcon;
}

/** Carrinho em formato drawer slide-in da direita com trigger pill. */
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

  protected readonly aberto = signal(false);

  protected readonly itens = signal<ItemCarrinho[]>([
    { id: 'i1', nome: 'Camiseta FIAP', categoria: 'Vestuário', preco: 89.9, quantidade: 2, icon: 'shirt' },
    { id: 'i2', nome: 'Caneca Angular Lover', categoria: 'Acessórios', preco: 39.9, quantidade: 1, icon: 'cup' },
  ]);

  protected readonly quantidadeTotal = computed(() =>
    this.itens().reduce((acc, i) => acc + i.quantidade, 0),
  );

  protected readonly subtotal = computed(() =>
    this.itens().reduce((acc, i) => acc + i.quantidade * i.preco, 0),
  );

  protected readonly frete = computed(() => (this.subtotal() > 150 ? 0 : 19.9));

  protected readonly total = computed(() => this.subtotal() + this.frete());

  constructor() {
    effect(() => {
      const url = this.router.url;
      if (url.startsWith('/carrinho') || this.embedded) {
        this.aberto.set(true);
      }
    });

    window.addEventListener('fiap:cart:add', this.onCartAdd as EventListener);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('fiap:cart:add', this.onCartAdd as EventListener);
    });
  }

  private readonly onCartAdd = (ev: Event): void => {
    const detail = (ev as CustomEvent<ItemCarrinho>).detail;
    if (!detail) return;
    this.itens.update(list => {
      const existente = list.find(i => i.id === detail.id);
      if (existente) {
        return list.map(i => i.id === detail.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...list, { ...detail, quantidade: 1 }];
    });
    this.aberto.set(true);
    window.dispatchEvent(new CustomEvent('fiap:notify', {
      detail: {
        tipo: 'success',
        titulo: 'Adicionado ao carrinho',
        mensagem: detail.nome,
      },
    }));
  };

  /** Abre o drawer. */
  protected abrir(): void {
    this.aberto.set(true);
  }

  /** Fecha o drawer. */
  protected fechar(): void {
    this.aberto.set(false);
  }

  /** Incrementa quantidade do item pelo id. */
  protected incrementar(id: string): void {
    this.itens.update(list =>
      list.map(i => (i.id === id ? { ...i, quantidade: i.quantidade + 1 } : i)),
    );
  }

  /** Decrementa quantidade; remove se chegar a zero. */
  protected decrementar(id: string): void {
    this.itens.update(list =>
      list
        .map(i => (i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter(i => i.quantidade > 0),
    );
  }

  /** Remove item pelo id. */
  protected remover(id: string): void {
    this.itens.update(list => list.filter(i => i.id !== id));
  }

  /** Fecha com ESC. */
  @HostListener('document:keydown.escape')
  protected onEsc(): void {
    if (this.aberto()) {
      this.fechar();
    }
  }
}
