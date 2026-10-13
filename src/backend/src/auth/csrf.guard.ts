import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { timingSafeEqual } from 'node:crypto';

/**
 * Valida double-submit: header X-CSRF-Token deve bater com o cookie csrf_token.
 * Aplicar em todo endpoint mutator autenticado (REST e GraphQL).
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = this.getRequest(ctx);
    const cookieToken: string | undefined = req?.cookies?.csrf_token;
    const headerToken: string | undefined = req?.headers?.['x-csrf-token'];
    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token ausente.');
    }
    const a = Buffer.from(cookieToken);
    const b = Buffer.from(headerToken);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new ForbiddenException('CSRF token inválido.');
    }
    return true;
  }

  private getRequest(ctx: ExecutionContext): any {
    if (ctx.getType<'http' | 'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req;
    }
    return ctx.switchToHttp().getRequest();
  }
}
