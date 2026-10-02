# syntax=docker/dockerfile:1

FROM node:24-slim AS base
WORKDIR /repo/server

FROM base AS deps
COPY server/package.json server/package-lock.json ./
RUN npm ci

FROM deps AS dev
ENV NODE_ENV=development
RUN apt-get update && apt-get install -y --no-install-recommends procps \
    && rm -rf /var/lib/apt/lists/*
COPY shared /repo/shared
COPY server .
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate:up && npm run start:dev"]

FROM deps AS build
COPY shared /repo/shared
COPY server .
RUN npm run build && npm prune --omit=dev

FROM base AS prod
ENV NODE_ENV=production
COPY --from=build --chown=node:node /repo/server/package.json ./
COPY --from=build --chown=node:node /repo/server/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/server/dist ./dist
COPY --from=build --chown=node:node /repo/server/migrations ./migrations
USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migrate:up && node ."]
