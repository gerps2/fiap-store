FROM node:20-alpine AS build
WORKDIR /app
COPY src/frontend/package*.json src/frontend/.npmrc ./
RUN npm ci
COPY src/frontend .
RUN npm run build -- host --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/host/browser /usr/share/nginx/html
COPY deployments/docker/host/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
