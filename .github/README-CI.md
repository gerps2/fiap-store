# CI/CD — fiap-store (Aula 4)

## Pipelines

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | push em `main`/`develop`, PR para `main` | lint → test → build → sonar (checks: `lint`, `test`, `build`, `sonar` + `SonarCloud Code Analysis`) |

O job `sonar` roda no mesmo `ci.yml`: declara `needs: [test, build]` e baixa o artifact `coverage-report` antes do scanner. Artifact pertence ao run que o criou — num workflow separado seriam necessários `workflow_run` + `download-artifact` com `run-id`, `github-token` e `actions: read`.

## Configuração necessária

### GitHub Secrets
| Secret | Descrição |
|--------|-----------|
| `SONAR_TOKEN` | Token gerado em sonarcloud.io (nome sugerido: `fiap-store-ci`) |

### SonarCloud
1. Entrar em https://sonarcloud.io com a conta do GitHub e importar `gerps2/fiap-store` (organização `gerps2`, project key `gerps2_fiap-store`)
2. Em **Administration → Analysis Method**, desligar **Automatic Analysis** (senão o scan via CI falha)
3. **My Account → Security → Generate Token** → nome `fiap-store-ci`
4. No GitHub: **Settings → Secrets and variables → Actions → New repository secret** → `SONAR_TOKEN`
5. Conferir `sonar.organization` e `sonar.projectKey` em `sonar-project.properties` com os valores exibidos no SonarCloud

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

## Rodando no seu fork

O `main` deste repositório segue o estado da Aula 5, então um PR da `aula-04` para ele entra em conflito. No seu fork:

```bash
# Refazer o hands-on do zero (ponto de partida da aula: ESLint e testes prontos, sem CI)
git push -f origin origin/aula-04-inicio:refs/heads/main

# ...ou partir do resultado final desta aula
git push -f origin origin/aula-04:refs/heads/main
```

1. Importe o seu fork no SonarCloud e desligue a **Automatic Analysis**
2. Ajuste `sonar.organization` e `sonar.projectKey` com os valores do seu projeto
3. Cadastre o `SONAR_TOKEN` nos secrets do seu fork
4. Crie um branch, faça uma mudança e abra o PR para o `main` do seu fork

O plano gratuito do SonarCloud mostra análises do `main` e de PRs; branches avulsas exigem plano pago.
