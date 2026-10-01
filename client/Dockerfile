# syntax=docker/dockerfile:1

FROM node:24-slim AS base
WORKDIR /repo/client

FROM base AS deps
COPY client/package.json client/package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY shared /repo/shared
COPY client .
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM deps AS build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY shared /repo/shared
COPY client .
RUN npm run build

FROM caddy:2-alpine AS prod
COPY client/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /repo/client/dist /srv
EXPOSE 80
