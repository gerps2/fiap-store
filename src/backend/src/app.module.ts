import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLFormattedError } from 'graphql';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TraceIdMiddleware } from './common/trace-id.middleware';
import { GlobalExceptionFilter } from './common/global-exception.filter';

const isProd = process.env.NODE_ENV === 'production';

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
      context: (ctx: { req?: unknown; res?: unknown; extra?: unknown }) => ctx,
      formatError: (formatted: GraphQLFormattedError): GraphQLFormattedError => {
        if (!isProd) return formatted;
        const { extensions, ...rest } = formatted;
        const safeExtensions = extensions ? { ...extensions } : {};
        delete (safeExtensions as Record<string, unknown>).stacktrace;
        delete (safeExtensions as Record<string, unknown>).originalError;
        return { ...rest, extensions: safeExtensions };
      },
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppResolver,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TraceIdMiddleware).forRoutes('*');
  }
}
