// @ts-check
const tseslint = require("typescript-eslint");
const angular = require("@angular-eslint/eslint-plugin");
const angularTemplate = require("@angular-eslint/eslint-plugin-template");
const templateParser = require("@angular-eslint/template-parser");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [...tseslint.configs.recommended],
    plugins: {
      "@angular-eslint": angular,
    },
    rules: {
      // Prefixos por MFE — cada microfrontend usa seu próprio prefixo
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: ["app", "host", "mfe", "produtos", "carrinho", "checkout", "sino", "notificacoes"],
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "host", "mfe", "produtos", "carrinho", "checkout", "sino", "notificacoes"],
          style: "kebab-case",
        },
      ],
      // Variáveis prefixadas com _ são intencionalmente não usadas
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": angularTemplate,
    },
    languageOptions: {
      parser: templateParser,
    },
    rules: {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/no-negated-async": "error",
    },
  }
);
