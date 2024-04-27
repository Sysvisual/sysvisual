# build stage
FROM node:lts as builder
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

# production stage
FROM node:lts-slim as production-stage
COPY --from=builder /app/dist /app
COPY --from=builder /app/.env /app/.env
COPY --from=builder /app/package*.json /app
COPY --from=builder /app/node_modules /app/node_modules

RUN 

WORKDIR /app
EXPOSE 8080
CMD ["node", "--env-file=.env", "server.js"]