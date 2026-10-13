import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CartItem } from './cart-item.entity';

@ObjectType()
@Entity('carts')
export class Cart {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text', unique: true })
  userId!: string;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (item) => item.cart, { eager: true, cascade: true })
  items!: CartItem[];

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  /** Total em centavos — calculado a partir de items.product.priceCents * quantity. */
  @Field(() => Int)
  get totalCents(): number {
    return (this.items ?? []).reduce(
      (sum, it) => sum + (it.product?.priceCents ?? 0) * it.quantity,
      0,
    );
  }

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
