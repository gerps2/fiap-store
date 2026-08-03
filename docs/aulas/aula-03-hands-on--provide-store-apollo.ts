// Aula 03 - Hands on / secao "saiba mais"
// Provider do Apollo: monta o link chain com um ApolloLink que injeta o
// header X-CSRF-Token lido do cookie csrf_token, e envia as requisicoes
// para {apiBase}/graphql com withCredentials.
//
// Trecho como veio na aula: os imports (provideApollo, inject, HttpLink,
// ApolloLink, from, InMemoryCache, Provider, EnvironmentProviders) e os
// helpers API_BASE_URL e readCookie nao faziam parte do material.

export function provideStoreApollo(): Provider | EnvironmentProviders {
  return provideApollo(() => {

    const httpLink = inject(HttpLink);

    const apiBase = inject(API_BASE_URL);

    const csrfLink = new ApolloLink((operation, forward) => {

      const token = readCookie('csrf_token');

      if (token) {

        operation.setContext(({ headers = {} }) => ({

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
