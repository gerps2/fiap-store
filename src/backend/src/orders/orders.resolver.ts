import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessTokenPayload } from '../auth/jwt-signer.service';

@Resolver(() => Order)
@UseGuards(JwtAuthGuard)
export class OrdersResolver {
  constructor(private readonly orders: OrdersService) {}

  @Query(() => [Order])
  myOrders(@CurrentUser() user: AccessTokenPayload): Promise<Order[]> {
    return this.orders.listByUser(user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Query(() => [Order])
  allOrders(): Promise<Order[]> {
    return this.orders.listAll();
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Order)
  checkout(@CurrentUser() user: AccessTokenPayload): Promise<Order> {
    return this.orders.checkout(user.sub);
  }
}
