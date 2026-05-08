import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';

@ObjectType()
@Entity('categories')
export class Category {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Field()
  @Column({ type: 'text', unique: true })
  slug!: string;

  @Field()
  @Column({ type: 'text' })
  name!: string;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
