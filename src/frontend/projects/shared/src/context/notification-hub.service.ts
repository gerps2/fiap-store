import { Injectable, signal } from '@angular/core';

export type HubKind = 'info' | 'success' | 'warning' | 'error';

export interface HubToast {
  id: string;
  kind: HubKind;
  title: string;
  body?: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private readonly channel = new BroadcastChannel('fiap:notifications');
  private readonly seenIds = new Set<string>();
  private readonly _toasts = signal<HubToast[]>([]);
  private readonly _unreadCount = signal(0);
  private readonly _ativo = signal<HubToast | null>(null);

  readonly toasts = this._toasts.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly ativo = this._ativo.asReadonly();

  constructor() {
    this.channel.onmessage = (evento: MessageEvent<HubToast>) => {
      if (this.seenIds.has(evento.data.id)) return;
      this.seenIds.add(evento.data.id);
      this.registrar(evento.data);
    };
  }

  push(params: Omit<HubToast, 'id' | 'createdAt'>, id: string = crypto.randomUUID()): string {
    if (this.seenIds.has(id)) return id;
    const toast: HubToast = { ...params, id, createdAt: Date.now() };
    this.seenIds.add(toast.id);
    this.registrar(toast);
    this.channel.postMessage(toast);
    return toast.id;
  }

  success(title: string, body?: string): string {
    return this.push({ kind: 'success', title, body });
  }

  error(title: string, body?: string): string {
    return this.push({ kind: 'error', title, body });
  }

  resetUnread(): void {
    this._unreadCount.set(0);
  }

  private registrar(toast: HubToast): void {
    this._toasts.update((lista) => [toast, ...lista]);
    this._unreadCount.update((n) => n + 1);
    this._ativo.set(toast);
    setTimeout(() => this._ativo.update((atual) => (atual?.id === toast.id ? null : atual)), 4000);
  }
}
