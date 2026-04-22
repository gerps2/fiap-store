const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-checkout',
  exposes: {
    './Component': './projects/mfe-checkout/src/app/pages/checkout/checkout.page.ts',
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    '@fiap/shared-ui',
    '@fiap/shared-context',
  ],
});
