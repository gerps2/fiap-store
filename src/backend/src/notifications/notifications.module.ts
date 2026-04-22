import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => AuthModule)],
  providers: [NotificationsService, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
