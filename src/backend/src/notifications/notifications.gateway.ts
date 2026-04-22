import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { Namespace, Server, Socket } from 'socket.io';
import { JwtSignerService } from '../auth/jwt-signer.service';

const NAMESPACE = '/ws/notifications';
const ACCESS_COOKIE = 'access_token';
const EVENT_NEW = 'notification:new';

function parseCookies(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

/**
 * Gateway Socket.IO em `/ws/notifications`.
 *
 * Segurança (handshake):
 *  - `io.use(middleware)` é executado **durante** o handshake HTTP upgrade, antes
 *    de aceitar o cliente. Lê `Cookie: access_token=...`, valida o JWT via
 *    JwtSignerService. Rejeita com `next(Error)` — o client recebe `connect_error`.
 *  - Socket aceito entra no room `user:<sub>`, isolando mensagens por usuário.
 *
 * Push:
 *  - `NotificationsService.publish()` chama `emitToUser(userId, payload)` e só
 *    os sockets daquele room recebem `notification:new`.
 */
@WebSocketGateway({
  namespace: NAMESPACE,
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit<Namespace>, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwt: JwtSignerService) {}

  afterInit(ns: Namespace): void {
    ns.use(async (socket: Socket, next) => {
      try {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies[ACCESS_COOKIE];
        if (!token) return next(new Error('UNAUTHORIZED: cookie access_token ausente'));
        const payload = await this.jwt.verify(token);
        if (!payload?.sub) return next(new Error('UNAUTHORIZED: sub ausente'));
        socket.data.userId = payload.sub;
        socket.data.groups = payload.groups ?? [];
        next();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'UNAUTHORIZED';
        this.logger.warn(`[ws] handshake rejected: ${msg}`);
        next(new Error(`UNAUTHORIZED: ${msg}`));
      }
    });
  }

  async handleConnection(socket: Socket): Promise<void> {
    const userId: string | undefined = socket.data.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    await socket.join(`user:${userId}`);
    this.logger.log(`[ws] ${socket.id} joined user:${userId}`);
  }

  handleDisconnect(socket: Socket): void {
    this.logger.log(`[ws] ${socket.id} disconnected`);
  }

  /** Emite payload apenas pros sockets do usuário dono. */
  emitToUser(userId: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(EVENT_NEW, payload);
  }
}
