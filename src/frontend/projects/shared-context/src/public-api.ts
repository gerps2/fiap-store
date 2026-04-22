/*
 * Public API do @fiap/shared-context
 * Contexto compartilhado entre host e MFEs — usuário logado, grupos, hydrate.
 */
export * from './lib/user-context.types';
export * from './lib/api-base-url.token';
export * from './lib/user-context.service';
export * from './lib/has-group.directive';
export * from './lib/apollo.provider';
export * from './lib/graphql/catalog.gql';
export * from './lib/graphql/cart.gql';
