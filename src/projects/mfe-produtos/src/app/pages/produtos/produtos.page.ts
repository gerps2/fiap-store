import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface Produto {
  readonly id: number;
  readonly nome: string;
  readonly preco: number;
  readonly rating: number;
  readonly avaliacoes: number;
  readonly categoria: string;
  readonly tag?: string;
  readonly icon: string;
}

type FaixaPreco = 'todas' | 'ate50' | '50a150' | '150mais';
type Ordenacao = 'relevancia' | 'preco-asc' | 'preco-desc' | 'avaliacao';

/** Catalogo premium de produtos FIAP Store com filtros, ordenacao e skeletons. */
@Component({
  selector: 'mfe-produtos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.css'],
})
export class ProdutosComponent {
  protected readonly categorias = ['Todos', 'Dev Gear', 'Livros', 'Cursos', 'Ofertas'];
  protected readonly skeletonArray = Array.from({ length: 8 }, (_, i) => i);

  protected readonly produtos = signal<readonly Produto[]>([
    { id: 1, nome: 'Camiseta FIAP Dev', preco: 89.9, rating: 4.6, avaliacoes: 214, categoria: 'Dev Gear', tag: 'NOVO', icon: 'shirt' },
    { id: 2, nome: 'Caneca Angular Lover', preco: 39.9, rating: 4.8, avaliacoes: 512, categoria: 'Dev Gear', icon: 'cup' },
    { id: 3, nome: 'Livro Microfrontends em Angular', preco: 129.9, rating: 4.9, avaliacoes: 78, categoria: 'Livros', tag: 'BEST-SELLER', icon: 'book' },
    { id: 4, nome: 'Curso Online Native Federation', preco: 349.0, rating: 4.7, avaliacoes: 186, categoria: 'Cursos', tag: 'OFERTA', icon: 'play' },
    { id: 5, nome: 'Mochila Tech FIAP', preco: 279.9, rating: 4.5, avaliacoes: 92, categoria: 'Dev Gear', icon: 'bag' },
    { id: 6, nome: 'Pack Adesivos Notebook', preco: 24.9, rating: 4.4, avaliacoes: 1204, categoria: 'Dev Gear', icon: 'sticker' },
    { id: 7, nome: 'Hoodie Dev Black', preco: 199.0, rating: 4.8, avaliacoes: 341, categoria: 'Dev Gear', tag: 'OFERTA', icon: 'hoodie' },
    { id: 8, nome: 'Livro Clean Code', preco: 149.9, rating: 4.9, avaliacoes: 2104, categoria: 'Livros', icon: 'book' },
  ]);

  protected readonly categoriaAtiva = signal<string>('Todos');
  protected readonly faixaPreco = signal<FaixaPreco>('todas');
  protected readonly avaliacaoMin = signal<number>(0);
  protected readonly ordenacao = signal<Ordenacao>('relevancia');
  protected readonly carregando = signal<boolean>(true);

  protected readonly produtosFiltrados = computed<readonly Produto[]>(() => {
    const cat = this.categoriaAtiva();
    const faixa = this.faixaPreco();
    const minStar = this.avaliacaoMin();
    const ord = this.ordenacao();

    let lista = this.produtos().filter((p) => {
      if (cat !== 'Todos') {
        if (cat === 'Ofertas') {
          if (p.tag !== 'OFERTA') return false;
        } else if (p.categoria !== cat) {
          return false;
        }
      }
      if (faixa === 'ate50' && p.preco > 50) return false;
      if (faixa === '50a150' && (p.preco < 50 || p.preco > 150)) return false;
      if (faixa === '150mais' && p.preco < 150) return false;
      if (minStar > 0 && p.rating < minStar) return false;
      return true;
    });

    const arr = [...lista];
    switch (ord) {
      case 'preco-asc': arr.sort((a, b) => a.preco - b.preco); break;
      case 'preco-desc': arr.sort((a, b) => b.preco - a.preco); break;
      case 'avaliacao': arr.sort((a, b) => b.rating - a.rating); break;
    }
    return arr;
  });

  constructor() {
    setTimeout(() => this.carregando.set(false), 800);
  }

  /** Alterna a faixa de preco ativa. */
  protected togglePreco(f: Exclude<FaixaPreco, 'todas'>): void {
    this.faixaPreco.update((atual) => (atual === f ? 'todas' : f));
  }

  /** Alterna a avaliacao minima. */
  protected toggleAvaliacao(n: number): void {
    this.avaliacaoMin.update((atual) => (atual === n ? 0 : n));
  }

  /** Define a ordenacao atual. */
  protected setOrdenacao(v: Ordenacao): void {
    this.ordenacao.set(v);
  }

  /** Restaura todos os filtros ao estado inicial. */
  protected limparFiltros(): void {
    this.categoriaAtiva.set('Todos');
    this.faixaPreco.set('todas');
    this.avaliacaoMin.set(0);
    this.ordenacao.set('relevancia');
  }

  /** Despacha evento global para o carrinho receber e abrir o drawer. */
  protected adicionar(p: Produto): void {
    window.dispatchEvent(new CustomEvent('fiap:cart:add', {
      detail: {
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        preco: p.preco,
        quantidade: 1,
        icon: this.iconeDe(p.categoria),
      },
    }));
  }

  private iconeDe(categoria: string): 'shirt' | 'cup' | 'book' | 'laptop' {
    const c = categoria.toLowerCase();
    if (c.includes('livro')) return 'book';
    if (c.includes('curso')) return 'laptop';
    if (c.includes('vest') || c.includes('camis')) return 'shirt';
    return 'cup';
  }

  /** Gera cinco estrelas SVG com preenchimento proporcional ao rating. */
  protected estrelasDe(rating: number): string {
    const path = 'M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1L12 2z';
    let out = '';
    for (let i = 0; i < 5; i++) {
      const filled = rating >= i + 1;
      const half = !filled && rating >= i + 0.5;
      const fill = filled ? '#F59E0B' : half ? 'url(#half' + i + ')' : 'transparent';
      const stroke = filled || half ? '#F59E0B' : 'var(--fiap-color-border-strong, #d1d5db)';
      const defs = half
        ? '<defs><linearGradient id="half' + i + '" x1="0" x2="1" y1="0" y2="0"><stop offset="50%" stop-color="#F59E0B"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>'
        : '';
      out += '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' + defs +
        '<path d="' + path + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    }
    return out;
  }

  /** Retorna o SVG inline correspondente ao tipo de icone do produto. */
  protected iconeDoProduto(tipo: string): string {
    const s = 'stroke="var(--fiap-dark)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    switch (tipo) {
      case 'shirt':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7l4-3 2 2h4l2-2 4 3-2 4h-2v9H8v-9H6L4 7z" ' + s + '/></svg>';
      case 'cup':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h12v9a3 3 0 01-3 3H7a3 3 0 01-3-3V7z" ' + s + '/><path d="M16 10h3a2 2 0 010 4h-3" ' + s + '/></svg>';
      case 'book':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" ' + s + '/><path d="M8 3v16" ' + s + '/></svg>';
      case 'play':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" ' + s + '/><path d="M11 9l4 3-4 3V9z" ' + s + '/></svg>';
      case 'bag':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 8h14l-1 12H6L5 8z" ' + s + '/><path d="M9 8a3 3 0 016 0" ' + s + '/></svg>';
      case 'sticker':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h12l4 4v12H4z" ' + s + '/><path d="M16 4v4h4" ' + s + '/></svg>';
      case 'hoodie':
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 10l3-5h8l3 5-3 2v8H8v-8l-3-2z" ' + s + '/><path d="M10 5a2 2 0 104 0" ' + s + '/></svg>';
      default:
        return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" ' + s + '/></svg>';
    }
  }
}
