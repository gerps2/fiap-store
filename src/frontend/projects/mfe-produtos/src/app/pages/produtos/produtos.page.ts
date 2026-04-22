import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Apollo } from 'apollo-angular';
import {
  ADD_TO_CART,
  LIST_PRODUCTS,
  type CartDto,
  type ProductDto,
} from '@fiap/shared';

interface Produto {
  readonly id: string;
  readonly nome: string;
  readonly preco: number;
  readonly categoria: string;
  readonly categoriaSlug: string;
  readonly imagem: string | null;
  readonly icon: 'shirt' | 'cup' | 'book' | 'laptop';
}

type FaixaPreco = 'todas' | 'ate50' | '50a150' | '150mais';
type Ordenacao = 'relevancia' | 'preco-asc' | 'preco-desc';

function iconeDe(slug: string): Produto['icon'] {
  if (slug.includes('livro')) return 'book';
  if (slug.includes('curso')) return 'laptop';
  if (slug.includes('camis')) return 'shirt';
  return 'cup';
}

/** Catalogo consumido via GraphQL (listProducts) — filtros/ordenacao client-side. */
@Component({
  selector: 'mfe-produtos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.css'],
})
export class ProdutosComponent {
  private readonly apollo = inject(Apollo);

  protected readonly skeletonArray = Array.from({ length: 8 }, (_, i) => i);

  protected readonly produtos = signal<readonly Produto[]>([]);
  protected readonly carregando = signal(true);

  constructor() {
    const destroyRef = inject(DestroyRef);
    const queryRef = this.apollo.watchQuery<{ listProducts: ProductDto[] }>({
      query: LIST_PRODUCTS,
      fetchPolicy: 'cache-and-network',
    });
    const sub = queryRef.valueChanges.subscribe((r) => {
      this.carregando.set(r.loading);
      const list = (r.data?.listProducts ?? []) as ProductDto[];
      this.produtos.set(
        list.map<Produto>((p) => ({
          id: p.id,
          nome: p.name,
          preco: p.priceCents / 100,
          categoria: p.category.name,
          categoriaSlug: p.category.slug,
          imagem: p.imageUrl,
          icon: iconeDe(p.category.slug),
        })),
      );
    });
    destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected readonly categorias = computed<string[]>(() => {
    const nomes = new Set<string>();
    for (const p of this.produtos()) nomes.add(p.categoria);
    return ['Todos', ...Array.from(nomes).sort()];
  });

  protected readonly categoriaAtiva = signal<string>('Todos');
  protected readonly faixaPreco = signal<FaixaPreco>('todas');
  protected readonly ordenacao = signal<Ordenacao>('relevancia');

  protected readonly produtosFiltrados = computed<readonly Produto[]>(() => {
    const cat = this.categoriaAtiva();
    const faixa = this.faixaPreco();
    const ord = this.ordenacao();

    let lista = this.produtos().filter((p) => {
      if (cat !== 'Todos' && p.categoria !== cat) return false;
      if (faixa === 'ate50' && p.preco > 50) return false;
      if (faixa === '50a150' && (p.preco < 50 || p.preco > 150)) return false;
      if (faixa === '150mais' && p.preco < 150) return false;
      return true;
    });

    const arr = [...lista];
    if (ord === 'preco-asc') arr.sort((a, b) => a.preco - b.preco);
    if (ord === 'preco-desc') arr.sort((a, b) => b.preco - a.preco);
    return arr;
  });

  /** Alterna a faixa de preco ativa. */
  protected togglePreco(f: Exclude<FaixaPreco, 'todas'>): void {
    this.faixaPreco.update((atual) => (atual === f ? 'todas' : f));
  }

  /** Define a ordenacao atual. */
  protected setOrdenacao(v: Ordenacao): void {
    this.ordenacao.set(v);
  }

  /** Restaura todos os filtros ao estado inicial. */
  protected limparFiltros(): void {
    this.categoriaAtiva.set('Todos');
    this.faixaPreco.set('todas');
    this.ordenacao.set('relevancia');
  }

  /** Chama mutation addToCart e, em sucesso, dispara evento global p/ o carrinho reagir. */
  protected async adicionar(p: Produto): Promise<void> {
    try {
      const res = await this.apollo.mutate<{ addToCart: CartDto }>({
        mutation: ADD_TO_CART,
        variables: { productId: p.id, quantity: 1 },
        refetchQueries: ['MyCart'],
      }).toPromise();
      if (res?.data?.addToCart) {
        window.dispatchEvent(new CustomEvent('fiap:cart:updated', { detail: res.data.addToCart }));
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('fiap:toast', {
        detail: { kind: 'ERROR', title: 'Erro', body: 'Não foi possível adicionar ao carrinho.' },
      }));
    }
  }

  /** Retorna o SVG inline correspondente ao tipo de icone do produto. */
  protected iconeDoProduto(tipo: Produto['icon']): string {
    const s = 'stroke="var(--fiap-dark)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    switch (tipo) {
      case 'shirt':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l4-3 2 2h4l2-2 4 3-2 4h-2v9H8v-9H6L4 7z" ' + s + '/></svg>';
      case 'cup':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h12v9a3 3 0 01-3 3H7a3 3 0 01-3-3V7z" ' + s + '/><path d="M16 10h3a2 2 0 010 4h-3" ' + s + '/></svg>';
      case 'book':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" ' + s + '/><path d="M8 3v16" ' + s + '/></svg>';
      case 'laptop':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="11" rx="2" ' + s + '/><path d="M2 19h20" ' + s + '/></svg>';
    }
  }
}
