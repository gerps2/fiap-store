import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Cart } from './cart.entity';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessTokenPayload } from '../auth/jwt-signer.service';

@Resolver(() => Cart)
@UseGuards(JwtAuthGuard)
export class CartResolver {
  constructor(private readonly cart: CartService) {}

  @Query(() => Cart)
  myCart(@CurrentUser() user: AccessTokenPayload): Promise<Cart> {
    return this.cart.getOrCreate(user.sub);
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Cart)
  addToCart(
    @CurrentUser() user: AccessTokenPayload,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('quantity', { type: () => Int, defaultValue: 1 }) quantity: number,
  ): Promise<Cart> {
    return this.cart.addItem(user.sub, productId, quantity);
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Cart)
  updateCartItem(
    @CurrentUser() user: AccessTokenPayload,
    @Args('itemId', { type: () => ID }) itemId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<Cart> {
    return this.cart.updateItem(user.sub, itemId, quantity);
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Cart)
  removeFromCart(
    @CurrentUser() user: AccessTokenPayload,
    @Args('itemId', { type: () => ID }) itemId: string,
  ): Promise<Cart> {
    return this.cart.removeItem(user.sub, itemId);
  }
}
