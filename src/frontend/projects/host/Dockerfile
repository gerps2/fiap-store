FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- shell --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/shell/browser /usr/share/nginx/html
COPY projects/host/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
