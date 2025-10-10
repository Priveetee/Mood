FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock .npmrc ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx prisma generate
RUN bun run build
EXPOSE 4173
CMD ["bun", "run", "preview", "--host", "0.0.0.0"]
