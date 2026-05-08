FROM node:20-alpine AS build
WORKDIR /app
COPY src/frontend/package*.json src/frontend/.npmrc ./
RUN npm ci
COPY src/frontend .
RUN npm run build -- mfe-produtos --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/mfe-produtos/browser /usr/share/nginx/html
COPY deployments/docker/mfe-produtos/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
