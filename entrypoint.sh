#!/bin/sh
set -euo pipefail

MAX_DB_ATTEMPTS="${DB_WAIT_MAX_ATTEMPTS:-30}"
DB_WAIT_INTERVAL_SECONDS="${DB_WAIT_INTERVAL_SECONDS:-2}"
EXPECTED_DB="${EXPECTED_DATABASE_NAME:-${POSTGRES_DB:-}}"

db_ping() {
  bun --eval "import pg from 'pg'; const client = new pg.Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); await client.query('SELECT 1'); await client.end();"
}

db_current_name() {
  bun --eval "import pg from 'pg'; const client = new pg.Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); const result = await client.query('SELECT current_database() AS name'); console.log(result.rows[0].name); await client.end();"
}

echo "[entrypoint] Waiting for database..."
attempt=1
until db_ping >/dev/null 2>&1; do
  if [ "${attempt}" -ge "${MAX_DB_ATTEMPTS}" ]; then
    echo "[entrypoint] Database is not reachable after ${MAX_DB_ATTEMPTS} attempts."
    exit 1
  fi
  attempt=$((attempt + 1))
  sleep "${DB_WAIT_INTERVAL_SECONDS}"
done

CURRENT_DB="$(db_current_name | tr -d '\r')"
echo "[entrypoint] Connected database: ${CURRENT_DB}"

if [ -n "${EXPECTED_DB}" ] && [ "${CURRENT_DB}" != "${EXPECTED_DB}" ]; then
  echo "[entrypoint] Refusing startup: expected database '${EXPECTED_DB}' but connected to '${CURRENT_DB}'."
  exit 1
fi

echo "[entrypoint] Running Prisma generate..."
bunx prisma generate

echo "[entrypoint] Running Prisma migrations..."
bunx prisma migrate deploy

echo "[entrypoint] Starting app..."
exec bun run start
