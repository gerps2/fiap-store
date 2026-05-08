FROM node:20-alpine AS build
WORKDIR /app
COPY src/backend/package*.json ./
RUN npm ci
COPY src/backend .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
