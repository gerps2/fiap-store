import { inject, Provider, EnvironmentProviders } from '@angular/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache, from } from '@apollo/client/core';
import { API_BASE_URL } from '@fiap/shared-context';

const CSRF_COOKIE = 'csrf_token';

function readCookie(name: string): string | null {
  const match = typeof document !== 'undefined'
    ? document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
    : null;
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Configura o Apollo Client único do host (shared entre MFEs via Native Federation).
 * Cadeia de links: csrfLink → httpLink. ErrorLink entra no V4.
 */
export function provideStoreApollo(): Provider | EnvironmentProviders {
  return provideApollo(() => {
    const httpLink = inject(HttpLink);
    const apiBase = inject(API_BASE_URL);

    const csrfLink = new ApolloLink((operation, forward) => {
      const token = readCookie(CSRF_COOKIE);
      if (token) {
        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: { ...headers, 'X-CSRF-Token': token },
        }));
      }
      return forward(operation);
    });

    return {
      link: from([
        csrfLink,
        httpLink.create({
          uri: `${apiBase}/graphql`,
          withCredentials: true,
        }),
      ]),
      cache: new InMemoryCache(),
    };
  });
}
