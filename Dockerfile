FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g bun

COPY bun.lock package.json ./

RUN bun install

COPY prisma ./prisma

RUN bunx prisma generate

COPY . .

RUN bun run build


FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client
RUN npm install -g bun

COPY bun.lock package.json ./

RUN bun install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
