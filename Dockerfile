# syntax=docker.io/docker/dockerfile:1
### Install dependencies
FROM node:25-alpine AS base
RUN npm install -g npm@11.12.1

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

### Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

RUN npm run build

### Production image
FROM gcr.io/distroless/nodejs24-debian13@sha256:482fabdb0f0353417ab878532bb3bf45df925e3741c285a68038fb138b714cba 
WORKDIR /app

ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 

EXPOSE 3000
CMD ["server.js"]
