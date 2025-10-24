# syntax=docker.io/docker/dockerfile:1
FROM node:25-alpine AS base

FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 user
RUN adduser --system --uid 1001 user

COPY /docker/harden.sh ./docker/harden.sh
COPY --from=builder --chown=user:user /app/.next/standalone ./
COPY --from=builder --chown=user:user /app/.next/static ./.next/static
COPY --from=builder --chown=user:user /app/public ./public 

USER root
RUN chmod +x docker/harden.sh
RUN docker/harden.sh
RUN rm -rf ./docker/harden.sh

USER user

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
