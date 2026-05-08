/*
 * Public API da @fiap/shared — lib única do fiap-store.
 *
 * Organizada em 3 áreas:
 *   - ui/       → componentes visuais (design system)
 *   - context/  → services de contexto (user, Apollo, notificações, WebSocket)
 *   - graphql/  → queries/mutations/tipos GraphQL
 */

// UI (design system)
export * from './ui/ui-button.component';
export * from './ui/ui-card.component';
export * from './ui/ui-badge.component';
export * from './ui/ui-input.component';
export * from './ui/ui-avatar.component';
export * from './ui/ui-empty-state.component';
export * from './ui/ui-spinner.component';
export * from './ui/ui-stack.component';
export * from './ui/ui-tabs.component';
export * from './ui/ui-topbar.component';
export * from './ui/ui-remote-outlet.component';

// Context (user, auth, notifs, apollo)
export * from './context/user-context.types';
export * from './context/api-base-url.token';
export * from './context/user-context.service';
export * from './context/has-group.directive';
export * from './context/apollo.provider';
export * from './context/notification-hub.service';
export * from './context/notifications-socket.service';

// GraphQL
export * from './graphql/catalog.gql';
export * from './graphql/cart.gql';
export * from './graphql/notifications.gql';
