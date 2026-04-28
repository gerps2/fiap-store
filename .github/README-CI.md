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

## Husky (pre-commit local)

```bash
cd src/frontend
npm install  # instala husky automaticamente via prepare script
```

A partir daí, cada `git commit` roda `lint-staged` nos arquivos `.ts`, `.html` e `.scss` modificados.
