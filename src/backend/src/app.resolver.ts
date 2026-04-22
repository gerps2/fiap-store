import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  /** Sanity query para confirmar que o GraphQL está no ar. */
  @Query(() => String)
  hello(): string {
    return 'fiap-store/backend — GraphQL up';
  }
}
