#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${BETTER_AUTH_SECRET:-}" ]]; then
  BETTER_AUTH_SECRET="$(bun --eval "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))")"
fi

if [[ -z "${BETTER_AUTH_URL:-}" ]]; then
  BETTER_AUTH_URL="http://localhost:3000"
fi

if [[ -z "${NEXT_PUBLIC_APP_URL:-}" ]]; then
  NEXT_PUBLIC_APP_URL="http://localhost:3000"
fi

export BETTER_AUTH_SECRET BETTER_AUTH_URL NEXT_PUBLIC_APP_URL

next build
