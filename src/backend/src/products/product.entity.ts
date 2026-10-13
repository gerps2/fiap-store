import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Category } from './category.entity';

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Field()
  @Column({ type: 'text', unique: true })
  sku!: string;

  @Field()
  @Column({ type: 'text' })
  name!: string;

  @Field()
  @Column({ type: 'text' })
  description!: string;

  @Field(() => Int)
  @Column({ type: 'integer' })
  priceCents!: number;

  @Field(() => String, { nullable: true })
  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text' })
  categoryId!: string;

  @Field(() => Category)
  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
