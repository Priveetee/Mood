FROM oven/bun:latest AS bun_installer

FROM node:22 AS deps
WORKDIR /app
RUN npm install -g npm@latest
COPY --from=bun_installer /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun_installer /usr/local/bin/bunx /usr/local/bin/bunx
RUN bun upgrade
COPY package.json bun.lock ./
RUN bun pm cache rm
RUN bun install

FROM node:22 AS builder
WORKDIR /app
RUN npm install -g npm@latest
COPY --from=deps /app/node_modules ./node_modules
COPY --from=bun_installer /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun_installer /usr/local/bin/bunx /usr/local/bin/bunx
RUN bun upgrade
COPY . .
RUN bun run build

FROM node:22 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt update && apt install -y postgresql-client && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm@latest

COPY --from=bun_installer /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun_installer /usr/local/bin/bunx /usr/local/bin/bunx
RUN bun upgrade

COPY package.json bun.lock ./
RUN bun pm cache rm
RUN bun install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY prisma ./prisma
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
