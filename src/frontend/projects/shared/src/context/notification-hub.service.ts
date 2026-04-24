import { computed, Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface HubToast {
  id: string;
  kind: ToastKind;
  title: string;
  body?: string;
  traceId?: string;
  createdAt: number;
}

/**
 * Hub central de toasts/notificações compartilhado entre host e todos os MFEs.
 *
 * Como funciona:
 *   - Qualquer MFE injeta o serviço e chama `push(...)` ou atalhos (`success`, `error`, `info`, `warning`).
 *   - O `mfe-notificacoes` lê o signal `toasts()` e renderiza.
 *   - Cada toast sai sozinho após `autoDismissMs` (default 5s) — pode ser fixado com `autoDismissMs: 0`.
 *
 * Cross-MFE via BroadcastChannel (`fiap:notifications`):
 *   - Mesmo com Native Federation fornecendo uma instância única no host, abas diferentes
 *     do browser continuam isoladas. O `BroadcastChannel` propaga cada `push(...)` para
 *     outras abas/janelas da mesma origem, mantendo toasts e sino em sincronia.
 *   - Para evitar incrementar o `unreadCount` duas vezes (local + eco), cada toast carrega
 *     um `id` aleatório (`crypto.randomUUID()`) e o receptor ignora mensagens cujo `id`
 *     já está no conjunto `seenIds`.
 *
 * Cenário didático (V4 da aula): ErrorLink do Apollo + GlobalErrorHandler do Angular
 * chamam `hub.error(...)` com o `traceId` de `extensions.traceId` — um toast aparece
 * imediatamente na UI, todos os MFEs (e abas) enxergam o mesmo hub.
 */
@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private readonly channel = new BroadcastChannel('fiap:notifications');
  private readonly _toasts = signal<HubToast[]>([]);
  private readonly _unreadCount = signal(0);
  private readonly seenIds = new Set<string>();

  readonly toasts = this._toasts.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  constructor() {
    this.channel.onmessage = (event: MessageEvent<HubToast>) => {
      const toast = event.data;
      if (!toast?.id || this.seenIds.has(toast.id)) {
        return;
      }
      this.seenIds.add(toast.id);
      this._toasts.update((list) => [...list, toast]);
      this._unreadCount.update((n) => n + 1);
    };
  }

  push(params: Omit<HubToast, 'id' | 'createdAt'> & { autoDismissMs?: number }): string {
    const id = this.generateId();
    const toast: HubToast = {
      id,
      kind: params.kind,
      title: params.title,
      body: params.body,
      traceId: params.traceId,
      createdAt: Date.now(),
    };
    this.seenIds.add(id);
    this._toasts.update((list) => [...list, toast]);
    this._unreadCount.update((n) => n + 1);
    this.channel.postMessage(toast);
    const autoDismiss = params.autoDismissMs ?? 5000;
    if (autoDismiss > 0) {
      setTimeout(() => this.dismiss(id), autoDismiss);
    }
    return id;
  }

  success(title: string, body?: string): string {
    return this.push({ kind: 'success', title, body });
  }

  info(title: string, body?: string): string {
    return this.push({ kind: 'info', title, body });
  }

  warning(title: string, body?: string): string {
    return this.push({ kind: 'warning', title, body });
  }

  error(title: string, body?: string, traceId?: string): string {
    return this.push({ kind: 'error', title, body, traceId });
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }

  /** Incrementa contagem de não-lidas (sino pisca). */
  incrementUnread(by = 1): void {
    this._unreadCount.update((n) => n + by);
  }

  /** Zera contagem (ao abrir a página de notificações, por exemplo). */
  resetUnread(): void {
    this._unreadCount.set(0);
  }

  private generateId(): string {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (g.crypto?.randomUUID) {
      return g.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
