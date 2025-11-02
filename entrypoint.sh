#!/bin/sh
set -e

echo "--- Waiting for database to be ready..."
while ! pg_isready -h postgres -U $POSTGRES_USER >/dev/null 2>&1; do
  sleep 1
done
echo "--- Database is ready!"

echo "--- Running database migrations..."
npx prisma migrate deploy
echo "--- Migrations finished."

echo "--- Starting application..."
exec bun run start
