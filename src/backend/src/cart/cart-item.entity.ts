import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Product } from '../products/product.entity';
import { Cart } from './cart.entity';

@ObjectType()
@Entity('cart_items')
export class CartItem {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart!: Cart;

  @Column({ type: 'text' })
  productId!: string;

  @Field(() => Product)
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Field(() => Int)
  @Column({ type: 'integer' })
  quantity!: number;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
