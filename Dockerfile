FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache curl bash
RUN curl -fsSL https://bun.com/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY bun.lock package.json ./

RUN bun install

COPY . .

RUN bun run build


FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache postgresql-client curl bash
RUN curl -fsSL https://bun.com/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY bun.lock package.json ./

RUN bun install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY prisma ./prisma
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
