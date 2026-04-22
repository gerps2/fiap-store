import { Injectable, signal } from '@angular/core';

export type ToastVariante = 'success' | 'warning' | 'info' | 'error';

export interface Toast {
  id: number;
  variante: ToastVariante;
  titulo: string;
  body?: string;
  leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  private _seq = 0;
  private _demoDone = false;

  readonly toasts = this._toasts.asReadonly();

  constructor() {
    this.agendarDemo();
  }

  /** Adiciona um toast e agenda remoção automática após 4s. */
  mostrar(toast: Omit<Toast, 'id'>): void {
    const id = ++this._seq;
    this._toasts.update((lista) => [...lista, { ...toast, id }]);
    setTimeout(() => this.remover(id), 4000);
  }

  /** Marca toast como saindo e remove do array após animação. */
  remover(id: number): void {
    this._toasts.update((lista) => lista.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      this._toasts.update((lista) => lista.filter((t) => t.id !== id));
    }, 240);
  }

  /** Dispara toast de sucesso. */
  sucesso(titulo: string, body?: string): void {
    this.mostrar({ variante: 'success', titulo, body });
  }

  /** Dispara toast de erro. */
  erro(titulo: string, body?: string): void {
    this.mostrar({ variante: 'error', titulo, body });
  }

  /** Dispara toast de aviso. */
  aviso(titulo: string, body?: string): void {
    this.mostrar({ variante: 'warning', titulo, body });
  }

  /** Dispara toast informativo. */
  info(titulo: string, body?: string): void {
    this.mostrar({ variante: 'info', titulo, body });
  }

  private agendarDemo(): void {
    if (this._demoDone) return;
    this._demoDone = true;
    setTimeout(() => this.info('Bem-vindo à FIAP Store', 'Novidades chegaram para você.'), 500);
    setTimeout(() => this.sucesso('Pedido #1042 confirmado', 'Seu pedido está a caminho.'), 1500);
    setTimeout(() => this.aviso('Promoção Black Friday', 'Descontos terminam em 24h.'), 3000);
  }
}
