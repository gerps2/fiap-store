import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AccessTokenPayload } from '../auth/jwt-signer.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Retorna o perfil do usuário logado (consumido pelo shared-context do frontend). */
  @Get('me')
  async me(@CurrentUser() user: AccessTokenPayload) {
    const fresh = await this.users.findById(user.sub);
    if (!fresh) throw new NotFoundException('Usuário não encontrado.');
    const { passwordHash: _passwordHash, ...safe } = fresh;
    return safe;
  }
}
