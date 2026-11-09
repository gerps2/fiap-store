const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-notificacoes',

  exposes: {
    './Sino': './projects/mfe-notificacoes/src/app/components/sino-notificacoes/sino-notificacoes.component.ts',
    './Pagina': './projects/mfe-notificacoes/src/app/pages/notificacoes/notificacoes.page.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    ignoreUnusedDeps: true,
  },
});
