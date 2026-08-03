// Aula 02 - Hands on / secao "saiba mais"
// Config de native-federation do mfe-produtos (projects/mfe-produtos/federation.config.js).
// Trecho como veio na aula: a linha de require do @angular-architects/native-federation
// (withNativeFederation, shareAll) nao fazia parte do material.

module.exports = withNativeFederation({

  name: 'mfe-produtos',

  exposes: { './Component': './projects/mfe-produtos/src/app/produtos.component.ts' },

  shared: {

    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),

  },

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

});
