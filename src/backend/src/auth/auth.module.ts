import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { RefreshToken } from './refresh-token.entity';
import { JwtSignerService } from './jwt-signer.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { CsrfGuard } from './csrf.guard';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [JwtSignerService, AuthService, JwtAuthGuard, RolesGuard, CsrfGuard],
  exports: [JwtSignerService, JwtAuthGuard, RolesGuard, CsrfGuard],
})
export class AuthModule {}
