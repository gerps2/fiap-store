import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { JwtSignerService } from './jwt-signer.service';

export interface AuthTokens {
  accessToken: string;
  refreshTokenId: string;
  csrfToken: string;
  user: { id: string; email: string; groups: string[] };
}

@Injectable()
export class AuthService {
  private readonly refreshTtlSec: number;

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtSignerService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {
    this.refreshTtlSec = Number(this.config.get<string>('JWT_REFRESH_TTL', '604800'));
  }

  /** Cadastra e já autentica. Se email existir, dispara argon2 dummy e 409 em tempo constante. */
  async signup(email: string, password: string): Promise<AuthTokens> {
    const user = await this.users.create(email, password, ['cliente']);
    return this.issueTokens(user);
  }

  /** Autentica por email+senha. Tempo constante contra email inexistente. */
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      await this.users.burnArgon2(password);
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const ok = await this.users.verifyPassword(user, password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas.');
    return this.issueTokens(user);
  }

  /** Rotaciona refresh token: revoga o antigo e emite novo par. Detecta reuse. */
  async refresh(refreshTokenId: string): Promise<AuthTokens> {
    if (!refreshTokenId) throw new UnauthorizedException('Refresh ausente.');
    const existing = await this.refreshRepo.findOne({ where: { id: refreshTokenId } });
    if (!existing) throw new UnauthorizedException('Refresh inválido.');

    if (existing.revokedAt) {
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Reuse detectado — todos os tokens foram revogados.');
    }
    if (existing.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh expirado.');
    }

    existing.revokedAt = new Date();
    await this.refreshRepo.save(existing);

    const user = await this.users.findById(existing.userId);
    if (!user) throw new InternalServerErrorException('Usuário do refresh não existe mais.');
    return this.issueTokens(user, existing.familyId);
  }

  /** Revoga o refresh token atual (logout). */
  async logout(refreshTokenId: string | undefined): Promise<void> {
    if (!refreshTokenId) return;
    await this.refreshRepo.update({ id: refreshTokenId }, { revokedAt: new Date() });
  }

  /** Emite o par access+refresh e um CSRF token fresco. */
  private async issueTokens(user: User, familyId?: string): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAccess({
      sub: user.id,
      email: user.email,
      groups: user.groups,
    });
    const refresh = this.refreshRepo.create({
      userId: user.id,
      familyId,
      expiresAt: new Date(Date.now() + this.refreshTtlSec * 1000),
      revokedAt: null,
    });
    const saved = await this.refreshRepo.save(refresh);
    const csrfToken = randomBytes(24).toString('hex');
    return {
      accessToken,
      refreshTokenId: saved.id,
      csrfToken,
      user: { id: user.id, email: user.email, groups: user.groups },
    };
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.refreshRepo.update(
      { familyId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** Limpa refresh tokens expirados e revogados antigos — invocado por cron externo ou manual. */
  async purgeExpired(): Promise<number> {
    const result = await this.refreshRepo.delete([
      { expiresAt: LessThan(new Date()) },
      { revokedAt: Not(IsNull()) },
    ]);
    return result.affected ?? 0;
  }
}
