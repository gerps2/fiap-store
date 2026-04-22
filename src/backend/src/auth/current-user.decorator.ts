import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AccessTokenPayload } from './jwt-signer.service';

/** Injeta o payload do JWT (request.user) em handler REST ou resolver GraphQL. */
export const CurrentUser = createParamDecorator<never>(
  (_data, ctx: ExecutionContext): AccessTokenPayload | undefined => {
    if (ctx.getType<'http' | 'graphql'>() === 'graphql') {
      const gql = GqlExecutionContext.create(ctx);
      return gql.getContext().req?.user;
    }
    return ctx.switchToHttp().getRequest().user;
  },
);
