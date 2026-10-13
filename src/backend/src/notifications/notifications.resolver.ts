import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessTokenPayload } from '../auth/jwt-signer.service';

/**
 * Histórico e mark-as-read ficam em GraphQL (grafo do domínio).
 * Real-time (push de novas notificações) vai via WebSocket/Socket.IO no NotificationsGateway —
 * protocolos separados com propósitos claros: GraphQL = leitura e mutação; WebSocket = push.
 */
@Resolver(() => Notification)
@UseGuards(JwtAuthGuard)
export class NotificationsResolver {
  constructor(private readonly svc: NotificationsService) {}

  @Query(() => [Notification])
  myNotifications(@CurrentUser() user: AccessTokenPayload): Promise<Notification[]> {
    return this.svc.listByUser(user.sub);
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Notification)
  markAsRead(
    @CurrentUser() user: AccessTokenPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Notification> {
    return this.svc.markAsRead(user.sub, id);
  }
}
