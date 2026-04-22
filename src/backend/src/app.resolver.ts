import { Query, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';

@Resolver()
export class AppResolver {
  /** Sanity query para confirmar que o GraphQL está no ar. */
  @Query(() => String)
  hello(): string {
    return 'fiap-store/backend — GraphQL up';
  }

  /** Disponível apenas fora de produção — simula erro 500 em resolver GraphQL. */
  @Query(() => String)
  boom(): string {
    if (process.env.NODE_ENV === 'production') throw new NotFoundException();
    throw new Error('kaboom — erro intencional no resolver GraphQL');
  }
}
