import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /** Rejeita se o usuário não estiver em nenhum dos grupos exigidos via @Roles(). */
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = this.getRequest(ctx);
    const userGroups: string[] = req?.user?.groups ?? [];
    const hit = required.some((g) => userGroups.includes(g));
    if (!hit) throw new ForbiddenException('Grupo insuficiente para acessar este recurso.');
    return true;
  }

  private getRequest(ctx: ExecutionContext): any {
    if (ctx.getType<'http' | 'graphql'>() === 'graphql') {
      return GqlExecutionContext.create(ctx).getContext().req;
    }
    return ctx.switchToHttp().getRequest();
  }
}
