import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Field()
  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  passwordHash!: string;

  @Field(() => [String])
  @Column({
    type: 'text',
    default: 'cliente',
    transformer: {
      to: (v: string[] | string | undefined) =>
        Array.isArray(v) ? v.join(',') : (v ?? ''),
      from: (v: unknown): string[] => {
        if (Array.isArray(v)) return v as string[];
        if (typeof v === 'string' && v.length > 0) return v.split(',').filter(Boolean);
        return [];
      },
    },
  })
  groups!: string[];

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
