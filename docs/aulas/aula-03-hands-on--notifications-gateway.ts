// Aula 03 - Hands on
// Gateway de WebSocket das notificacoes. Autentica no handshake lendo o
// cookie access_token, coloca cada socket numa sala por usuario
// (user:<id>) e expoe emitToUser para mandar evento so para aquele usuario.
//
// Trecho como veio na aula: os imports (@nestjs/websockets, socket.io,
// JwtSignerService) e o helper parseCookies nao faziam parte do material.

@WebSocketGateway({

  namespace: '/ws/notifications',

  cors: { origin: 'http://localhost:4200', credentials: true },

})
export class NotificationsGateway implements OnGatewayInit<Namespace> {

  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtSignerService) {}

  afterInit(ns: Namespace) {

    ns.use(async (socket, next) => {

      const token = parseCookies(socket.handshake.headers.cookie)['access_token'];

      if (!token) return next(new Error('UNAUTHORIZED'));

      try {

        const payload = await this.jwt.verify(token);

        socket.data.userId = payload.sub;

        next();

      } catch {

        next(new Error('UNAUTHORIZED'));

      }

    });

  }

  async handleConnection(socket: Socket) {

    await socket.join(`user:${socket.data.userId}`);

  }

  emitToUser(userId: string, payload: unknown) {

    this.server.to(`user:${userId}`).emit('notification:new', payload);

  }

}
