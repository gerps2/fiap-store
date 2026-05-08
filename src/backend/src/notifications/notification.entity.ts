import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum NotificationKind {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

registerEnumType(NotificationKind, { name: 'NotificationKind' });

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @Field(() => NotificationKind)
  @Column({ type: 'text' })
  kind!: NotificationKind;

  @Field()
  @Column({ type: 'text' })
  title!: string;

  @Field()
  @Column({ type: 'text' })
  body!: string;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'datetime', nullable: true })
  readAt!: Date | null;

  @Field()
  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = uuid();
  }
}
