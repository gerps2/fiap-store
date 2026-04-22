import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class OrderItemSnapshot {
  @Field() productId!: string;
  @Field() sku!: string;
  @Field() name!: string;
  @Field(() => Int) priceCents!: number;
  @Field(() => Int) quantity!: number;
}

@ObjectType()
@Entity('orders')
export class Order {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @Field(() => OrderStatus)
  @Column({ type: 'text', default: 'PENDING' })
  status!: OrderStatus;

  @Field(() => Int)
  @Column({ type: 'integer' })
  totalCents!: number;

  @Field(() => [OrderItemSnapshot])
  @Column({
    type: 'text',
    transformer: {
      to: (v: OrderItemSnapshot[]) => JSON.stringify(v ?? []),
      from: (v: unknown): OrderItemSnapshot[] => {
        if (Array.isArray(v)) return v as OrderItemSnapshot[];
        if (typeof v === 'string' && v.length > 0) {
          try { return JSON.parse(v); } catch { return []; }
        }
        return [];
      },
    },
  })
  items!: OrderItemSnapshot[];

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
