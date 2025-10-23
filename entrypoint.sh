#!/bin/bash
set -e

export PATH="/root/.bun/bin:$PATH"

while ! pg_isready -h postgres -U $POSTGRES_USER >/dev/null 2>&1; do
  sleep 1
done

bunx prisma migrate deploy

exec bun run start
