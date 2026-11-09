import { EnvironmentProviders, Provider, inject } from '@angular/core';
import { ApolloLink, InMemoryCache, from } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { API_BASE_URL } from './api-base-url.token';
import { NotificationHubService } from './notification-hub.service';

/** Lê um cookie não-httpOnly pelo nome. */
export function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Apollo Client da loja: errorLink → csrfLink → httpLink com cookies. */
export function provideStoreApollo(): Provider | EnvironmentProviders {
  return provideApollo(() => {
    const httpLink = inject(HttpLink);
    const apiBase = inject(API_BASE_URL);
    const hub = inject(NotificationHubService);

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      for (const erro of graphQLErrors ?? []) {
        const code = erro.extensions?.['code'] as string | undefined;
        const traceId = erro.extensions?.['traceId'] as string | undefined;
        hub.error(erro.message, code ? `Código: ${code} · Trace: ${traceId?.slice(0, 8)}` : undefined);
      }
      if (networkError) {
        hub.error('Sem conexão com a API', 'Verifique se o backend está no ar.');
      }
    });

    const csrfLink = new ApolloLink((operation, forward) => {
      const token = readCookie('csrf_token');
      if (token) {
        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: { ...headers, 'X-CSRF-Token': token },
        }));
      }
      return forward(operation);
    });

    return {
      link: from([errorLink, csrfLink, httpLink.create({ uri: `${apiBase}/graphql`, withCredentials: true })]),
      cache: new InMemoryCache(),
    };
  });
}
