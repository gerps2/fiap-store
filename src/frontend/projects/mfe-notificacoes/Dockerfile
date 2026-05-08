FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- mfe-notificacoes --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/mfe-notificacoes/browser /usr/share/nginx/html
COPY projects/mfe-notificacoes/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
