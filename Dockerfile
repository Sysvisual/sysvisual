# build stage
FROM node:lts-alpine as builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

# production stage
FROM node:lts-slim as production-stage
COPY --from=builder /app/dist /app
WORKDIR /app
EXPOSE 8080
CMD ["node", "dist/server.js"]