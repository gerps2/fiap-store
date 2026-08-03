// Aula 03 - Hands on / secao "saiba mais"
// Link de erro do Apollo: traduz falha de GraphQL e falha de rede em
// notificacao no hub, expondo o code e os 8 primeiros caracteres do traceId.
//
// Trecho como veio na aula: os imports (onError do @apollo/client/link/error
// e o `hub`) nao faziam parte do material.
//
// Fonte: Elaborado pelo autor (2026)

const errorLink = onError(({ graphQLErrors, networkError }) => {

  if (graphQLErrors) {

    for (const err of graphQLErrors) {

      const code = err.extensions?.['code'] as string;

      const traceId = err.extensions?.['traceId'] as string;

      hub.error(err.message, `Código: ${code} · Trace: ${traceId?.slice(0,8)}`);

    }
  }

  if (networkError) hub.error('Sem conexão', 'Verifique sua internet.');
});
