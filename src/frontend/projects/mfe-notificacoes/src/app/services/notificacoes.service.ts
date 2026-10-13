import { Injectable, computed, signal } from '@angular/core';

export interface Notificacao {
  id: number;
  titulo: string;
  lida: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private proximoId = 4;

  readonly itens = signal<Notificacao[]>([
    { id: 1, titulo: 'Seu pedido foi confirmado', lida: false },
    { id: 2, titulo: 'Promoção de 20% no checkout', lida: false },
    { id: 3, titulo: 'Produto voltou ao estoque', lida: false },
  ]);
  readonly naoLidas = computed(() => this.itens().filter((n) => !n.lida).length);
  readonly toast = signal<string | null>(null);

  constructor() {
    window.addEventListener('fiap:notify', (ev) => {
      const titulo = (ev as CustomEvent<{ titulo: string }>).detail?.titulo;
      if (titulo) this.adicionar(titulo);
    });
  }

  adicionar(titulo: string): void {
    this.itens.update((lista) => [{ id: this.proximoId++, titulo, lida: false }, ...lista]);
    this.toast.set(titulo);
    setTimeout(() => this.toast.set(null), 4000);
  }

  marcarComoLida(id: number): void {
    this.itens.update((lista) => lista.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  marcarTodasComoLidas(): void {
    this.itens.update((lista) => lista.map((n) => ({ ...n, lida: true })));
  }
}
