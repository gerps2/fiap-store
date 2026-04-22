import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtSignerService } from './jwt-signer.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtSignerService) {}

  /** Valida o access token (cookie httpOnly) e popula request.user. */
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(ctx);
    const token = req?.cookies?.access_token;
    if (!token) throw new UnauthorizedException('Token ausente.');
    try {
      req.user = await this.jwt.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }

  private getRequest(ctx: ExecutionContext): any {
    if (ctx.getType<'http' | 'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req;
    }
    return ctx.switchToHttp().getRequest();
  }
}
