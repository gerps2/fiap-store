# Aula 05 - Hands on
# Dockerfile do Shell Angular, multi-stage: builda o host com Node e serve o
# resultado num nginx unprivileged na porta 8080.
#
# Fonte: Elaborado pelo autor (2026)

FROM node:20.19.2-alpine3.21 AS build
WORKDIR /app
COPY src/frontend/package*.json src/frontend/.npmrc ./
RUN npm ci
COPY src/frontend .
RUN npm run build -- host --configuration production

FROM nginxinc/nginx-unprivileged:1.27.4-alpine
COPY --from=build /app/dist/host/browser /usr/share/nginx/html
COPY deployments/docker/shell/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
