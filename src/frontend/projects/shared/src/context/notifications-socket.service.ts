import { Injectable, inject } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { API_BASE_URL } from './api-base-url.token';
import { type HubKind, NotificationHubService } from './notification-hub.service';

interface NotificacaoServidor {
  id: string;
  kind: string;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsSocketService {
  private readonly apiBase = inject(API_BASE_URL);
  private readonly hub = inject(NotificationHubService);
  private socket: Socket | null = null;

  /** Abre o socket; o cookie httpOnly vai junto no handshake. */
  connect(): void {
    if (this.socket) return;
    this.socket = io(`${this.apiBase}/ws/notifications`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    this.socket.on('notification:new', (n: NotificacaoServidor) => {
      this.hub.push({ kind: n.kind.toLowerCase() as HubKind, title: n.title, body: n.body }, n.id);
    });
    this.socket.on('connect_error', (erro) => {
      console.warn('[notifications-socket] handshake recusado:', erro.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
