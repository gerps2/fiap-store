import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { pubsub, NOTIFICATION_ADDED } from './pubsub';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessTokenPayload } from '../auth/jwt-signer.service';

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

  /** Stream em tempo real filtrado pelo userId do JWT. */
  @Subscription(() => Notification, {
    filter: (payload, _vars, context) => {
      const userId = context?.req?.user?.sub ?? context?.extra?.user?.sub;
      return payload?.[NOTIFICATION_ADDED]?.userId === userId;
    },
  })
  notificationAdded() {
    return pubsub.asyncIterator(NOTIFICATION_ADDED);
  }
}
