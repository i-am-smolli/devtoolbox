# syntax=docker.io/docker/dockerfile:1
### Install (installation) dependencies
FROM node:26-alpine@sha256:e71ac5e964b9201072425d59d2e876359efa25dc96bb1768cb73295728d6e4ea AS base
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
FROM gcr.io/distroless/nodejs24-debian13@sha256:e7192174b2b2e5db60cb8f8fc3dcb8cb8e0456f961387c4e0556118f09dcb7c8
WORKDIR /app

ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 

EXPOSE 3000
CMD ["server.js"]
