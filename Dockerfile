# syntax=docker.io/docker/dockerfile:1
### Install (installation) dependencies
FROM node:26-alpine@sha256:144769ec3f32e8ee36b3cfde91e82bee25d9367b20f31a151f3f7eea3a2a8541 AS base
RUN npm install -g npm@11.16.0
RUN npm install -g pnpm@11.5.2

### Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile 

### Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

RUN pnpm run build

### Production image
FROM cgr.dev/chainguard/node:latest
WORKDIR /app

ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 

EXPOSE 3000
CMD ["server.js"]
