import { Injectable, computed, signal } from '@angular/core';

export interface Notificacao {
  id: number;
  titulo: string;
  lida: boolean;
  criadaEm: Date;
}

/** Serviço de notificações escopado ao remote (não compartilhado entre consumidores via federation). */
@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private readonly _itens = signal<Notificacao[]>([
    { id: 1, titulo: 'Pedido #1042 confirmado', lida: false, criadaEm: new Date() },
    { id: 2, titulo: 'Promoção Black Friday começou', lida: false, criadaEm: new Date() },
    { id: 3, titulo: 'Newsletter semanal disponível', lida: true, criadaEm: new Date() },
  ]);

  readonly itens = this._itens.asReadonly();
  readonly naoLidas = computed(() => this._itens().filter((n) => !n.lida).length);

  marcarComoLida(id: number): void {
    this._itens.update((lista) => lista.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  marcarTodasComoLidas(): void {
    this._itens.update((lista) => lista.map((n) => ({ ...n, lida: true })));
  }

  /** Adiciona nova notificação no topo da lista. */
  adicionar(titulo: string): void {
    const id = Math.max(0, ...this._itens().map((n) => n.id)) + 1;
    this._itens.update((lista) => [{ id, titulo, lida: false, criadaEm: new Date() }, ...lista]);
  }
}
