#!/bin/sh
set -e

while ! pg_isready -h postgres -U $POSTGRES_USER > /dev/null 2>&1; do
  sleep 1
done

npx prisma migrate deploy

exec bun run start
