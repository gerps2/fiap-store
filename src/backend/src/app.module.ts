import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        database: process.env.DATABASE_PATH ?? './db.sqlite',
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        migrationsRun: true,
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      subscriptions: { 'graphql-ws': true },
      context: (ctx: { req?: unknown; res?: unknown; extra?: unknown }) => ctx,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppResolver],
})
export class AppModule {}
