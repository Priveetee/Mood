FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g bun

COPY bun.lock package.json ./

RUN bun install

COPY . .

RUN bun run build


FROM node:20-alpine

WORKDIR /app

RUN npm install -g bun

COPY bun.lock package.json ./

RUN bun install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["bun", "run", "start"]
