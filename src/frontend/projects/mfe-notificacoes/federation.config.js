const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-notificacoes',

  // Sino → widget reutilizado pelo host e outros remotes; Pagina → tela completa com sub-rotas.
  exposes: {
    './Sino': './projects/mfe-notificacoes/src/app/components/sino-notificacoes/sino-notificacoes.component.ts',
    './Pagina': './projects/mfe-notificacoes/src/app/pages/notificacoes/notificacoes.page.ts',
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },

  skip: [
    'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket',
    '@fiap/shared',
    'react', 'react-dom', 'react-dom/server', 'relay-runtime',
    '@apollo/client/react',
    '@apollo/client/react/hoc',
    '@apollo/client/react/context',
    '@apollo/client/react/parser',
    '@apollo/client/react/ssr',
    '@apollo/client/react/hooks',
    '@apollo/client/testing',
    '@apollo/client/testing/core',
    '@apollo/client/testing/internal',
    '@apollo/client/testing/experimental',
    '@apollo/client/testing/react',
    '@apollo/client/link/ws',
    'subscriptions-transport-ws',
    '@graphql-tools/schema', '@graphql-tools/merge', '@graphql-tools/utils',
    '@jest/expect-utils', '@jest/globals', 'jest-matcher-utils',
    '@testing-library/react',
    'crossws',
  ],
});
