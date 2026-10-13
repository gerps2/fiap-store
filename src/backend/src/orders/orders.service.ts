import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, OrderItemSnapshot } from './order.entity';
import { CartService } from '../cart/cart.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationKind } from '../notifications/notification.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly cart: CartService,
    private readonly notifs: NotificationsService,
  ) {}

  listByUser(userId: string): Promise<Order[]> {
    return this.orders.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  listAll(): Promise<Order[]> {
    return this.orders.find({ order: { createdAt: 'DESC' } });
  }

  /** Efetiva o checkout: snapshot do cart, persiste order, limpa cart, publica notificação. */
  async checkout(userId: string): Promise<Order> {
    const cart = await this.cart.getOrCreate(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Carrinho vazio.');
    }

    const items: OrderItemSnapshot[] = cart.items.map((it) => ({
      productId: it.product.id,
      sku: it.product.sku,
      name: it.product.name,
      priceCents: it.product.priceCents,
      quantity: it.quantity,
    }));
    const totalCents = items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

    const order = await this.orders.save(
      this.orders.create({ userId, status: OrderStatus.PENDING, items, totalCents }),
    );
    await this.cart.clear(userId);

    await this.notifs.publish(
      userId,
      NotificationKind.SUCCESS,
      'Pedido criado',
      `Seu pedido #${order.id.slice(0, 8)} foi criado (R$ ${(totalCents / 100).toFixed(2)}).`,
    );

    return order;
  }
}
