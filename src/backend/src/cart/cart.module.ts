import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../products/product.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
    forwardRef(() => AuthModule),
  ],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
