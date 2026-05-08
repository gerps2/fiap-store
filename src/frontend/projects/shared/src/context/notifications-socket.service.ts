import { DestroyRef, Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api-base-url.token';
import { NotificationHubService } from './notification-hub.service';
import type { NotifKind } from '../graphql/notifications.gql';

const NAMESPACE = '/ws/notifications';
const EVENT_NEW = 'notification:new';

interface IncomingNotification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  createdAt: string;
}

/**
 * Cliente Socket.IO do fiap-store.
 *
 * Segurança:
 *  - `withCredentials: true` garante que o cookie httpOnly `access_token` é
 *    enviado automaticamente no handshake pelo browser (cross-origin).
 *  - O gateway do backend valida o JWT ali e só aceita a conexão se for válido.
 *  - Cada socket entra num room `user:<id>` → mensagens não vazam entre usuários.
 *
 * Uso:
 *  - `connect()` abre a conexão após o login (quando já temos o cookie).
 *  - `disconnect()` fecha ao logout.
 *  - Toda notificação recebida é empurrada pro `NotificationHubService` (toast + badge).
 */
@Injectable({ providedIn: 'root' })
export class NotificationsSocketService {
  private readonly apiBase = inject(API_BASE_URL);
  private readonly hub = inject(NotificationHubService);
  private socket: Socket | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.disconnect());
  }

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(`${this.apiBase}${NAMESPACE}`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect_error', (err: Error) => {
      this.hub.warning('Notificações offline', err.message || 'Falha ao conectar stream.');
    });

    this.socket.on(EVENT_NEW, (payload: IncomingNotification) => {
      const kind = this.mapKind(payload.kind);
      this.hub.push({ kind, title: payload.title, body: payload.body });
      this.hub.incrementUnread();
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  private mapKind(k: NotifKind): 'success' | 'info' | 'warning' | 'error' {
    if (k === 'SUCCESS') return 'success';
    if (k === 'WARNING') return 'warning';
    if (k === 'ERROR') return 'error';
    return 'info';
  }
}
