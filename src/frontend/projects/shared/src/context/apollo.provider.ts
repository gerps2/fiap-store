import { EnvironmentProviders, Provider, inject } from '@angular/core';
import { ApolloLink, InMemoryCache, from } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { API_BASE_URL } from './api-base-url.token';

/** Lê um cookie não-httpOnly pelo nome. */
export function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Apollo Client da loja: csrfLink → httpLink com cookies. */
export function provideStoreApollo(): Provider | EnvironmentProviders {
  return provideApollo(() => {
    const httpLink = inject(HttpLink);
    const apiBase = inject(API_BASE_URL);

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
      link: from([csrfLink, httpLink.create({ uri: `${apiBase}/graphql`, withCredentials: true })]),
      cache: new InMemoryCache(),
    };
  });
}
