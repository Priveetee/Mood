FROM oven/bun:1.3.11-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV DATABASE_URL="postgresql://mood_user:password@localhost:5432/mood_db"
ENV PRISMA_CLI_BINARY_TARGETS="linux-musl-openssl-3.0.x"
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN bunx prisma generate
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
