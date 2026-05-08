FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- mfe-checkout --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/mfe-checkout/browser /usr/share/nginx/html
COPY projects/mfe-checkout/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
