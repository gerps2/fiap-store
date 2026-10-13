import { forwardRef, Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationKind } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly gateway: NotificationsGateway,
  ) {}

  /** Persiste e empurra a notificação por WebSocket apenas pro room do dono. */
  async publish(
    userId: string,
    kind: NotificationKind,
    title: string,
    body: string,
  ): Promise<Notification> {
    const notif = await this.repo.save(
      this.repo.create({ userId, kind, title, body, readAt: null }),
    );
    this.gateway.emitToUser(userId, {
      id: notif.id,
      kind: notif.kind,
      title: notif.title,
      body: notif.body,
      createdAt: notif.createdAt.toISOString?.() ?? notif.createdAt,
    });
    return notif;
  }

  listByUser(userId: string): Promise<Notification[]> {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async markAsRead(userId: string, id: string): Promise<Notification> {
    const notif = await this.repo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notificação não existe.');
    if (notif.userId !== userId) throw new ForbiddenException('Notificação não pertence a você.');
    notif.readAt = new Date();
    return this.repo.save(notif);
  }
}
