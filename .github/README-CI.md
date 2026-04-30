# CI/CD — fiap-store (Aula 4)

## Pipelines

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | push/PR em `main` | lint → test → build |
| `quality.yml` | push em `main` / PR | SonarCloud analysis |

## Configuração necessária

### GitHub Secrets
| Secret | Descrição |
|--------|-----------|
| `SONAR_TOKEN` | Token gerado em sonarcloud.io |

### SonarCloud
1. Criar conta em https://sonarcloud.io
2. Importar o repositório
3. Copiar o `SONAR_TOKEN` para os secrets do GitHub
4. Criar organização `fiap-postech` (ou ajustar `sonar.organization` em `sonar-project.properties`)

## Husky (pre-commit local) — monorepo

O Husky vive na **raiz** do repositório (não em `src/frontend/`) porque o `.git/` está na raiz e o Git só lê `core.hooksPath` configurado no git root.

```bash
# 1. Na raiz do repo: instala husky e configura hooks
cd fiap-store
npm install

# 2. No frontend: instala dependências do Angular (inclui lint-staged + prettier)
cd src/frontend
npm install
```

A partir daí, cada `git commit` dispara `.husky/pre-commit`, que entra em `src/frontend/` e executa `lint-staged` nos arquivos `.ts`, `.html`, `.scss` e `.css` modificados (ESLint --fix + Prettier --write).

## Rodando o pipeline localmente

```bash
cd src/frontend
npm run lint        # ESLint em todos os projects
npm run test:ci     # Karma headless + coverage (lcov.info gerado em coverage/)
npm run build:all   # build do shared-ui + host + 4 MFEs
```
