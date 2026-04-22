import { computed, Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export interface HubToast {
  id: number;
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
 * Cenário didático (V4 da aula): ErrorLink do Apollo + GlobalErrorHandler do Angular
 * chamam `hub.error(...)` com o `traceId` de `extensions.traceId` — um toast aparece
 * imediatamente na UI, todos os MFEs enxergam o mesmo hub porque o service é uma
 * única instância (shared deps do Native Federation).
 */
@Injectable({ providedIn: 'root' })
export class NotificationHubService {
  private readonly _toasts = signal<HubToast[]>([]);
  private readonly _unreadCount = signal(0);
  private sequence = 0;

  readonly toasts = this._toasts.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  push(params: Omit<HubToast, 'id' | 'createdAt'> & { autoDismissMs?: number }): number {
    const id = ++this.sequence;
    const toast: HubToast = {
      id,
      kind: params.kind,
      title: params.title,
      body: params.body,
      traceId: params.traceId,
      createdAt: Date.now(),
    };
    this._toasts.update((list) => [...list, toast]);
    const autoDismiss = params.autoDismissMs ?? 5000;
    if (autoDismiss > 0) {
      setTimeout(() => this.dismiss(id), autoDismiss);
    }
    return id;
  }

  success(title: string, body?: string): number {
    return this.push({ kind: 'success', title, body });
  }

  info(title: string, body?: string): number {
    return this.push({ kind: 'info', title, body });
  }

  warning(title: string, body?: string): number {
    return this.push({ kind: 'warning', title, body });
  }

  error(title: string, body?: string, traceId?: string): number {
    return this.push({ kind: 'error', title, body, traceId });
  }

  dismiss(id: number): void {
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
}
