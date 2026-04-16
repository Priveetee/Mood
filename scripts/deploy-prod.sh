#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.yml"
REMOTE="${REMOTE:-origin}"
REF="${REF:-main}"
SKIP_PULL="${SKIP_PULL:-0}"
SKIP_BACKUP="${SKIP_BACKUP:-0}"
STASH_DIRTY="${STASH_DIRTY:-0}"
WAIT_SECONDS="${WAIT_SECONDS:-4}"

source "${SCRIPT_DIR}/deploy-common.sh"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/deploy-prod.sh [options]

Options:
  --remote <name>    git remote (default: origin)
  --ref <branch>     git branch/ref (default: main)
  --skip-pull        skip git fetch/pull
  --skip-backup      skip pg_dump backup
  --stash-dirty      stash local changes before pull
  --wait <seconds>   wait before HTTP smoke test (default: 4)
  -h, --help         show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="$2"
      shift 2
      ;;
    --ref)
      REF="$2"
      shift 2
      ;;
    --skip-pull)
      SKIP_PULL=1
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=1
      shift
      ;;
    --stash-dirty)
      STASH_DIRTY=1
      shift
      ;;
    --wait)
      WAIT_SECONDS="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[deploy] Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

need_cmd git
need_cmd docker
need_cmd curl

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${ROOT_DIR}/.env.example" "${ENV_FILE}"
  ensure_mood_env_defaults "${ENV_FILE}"
  echo "[deploy] Created ${ENV_FILE} from .env.example"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "[deploy] docker compose v2 is required" >&2
  exit 1
fi

STASH_LABEL=""
if ! git -C "${ROOT_DIR}" diff --quiet || ! git -C "${ROOT_DIR}" diff --cached --quiet; then
  if [[ "${STASH_DIRTY}" != "1" ]]; then
    echo "[deploy] Git tree is dirty. Re-run with --stash-dirty or clean the tree." >&2
    exit 1
  fi
  STASH_LABEL="deploy-prod-$(date +%F_%H%M%S)"
  git -C "${ROOT_DIR}" stash push -u -m "${STASH_LABEL}" >/dev/null
  echo "[deploy] Stashed local changes: ${STASH_LABEL}"
fi

if [[ "${SKIP_PULL}" != "1" ]]; then
  git -C "${ROOT_DIR}" fetch "${REMOTE}"
  git -C "${ROOT_DIR}" pull --ff-only "${REMOTE}" "${REF}"
fi

set -a
source "${ENV_FILE}"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -z "${POSTGRES_USER:-}" || -z "${POSTGRES_PASSWORD:-}" || -z "${POSTGRES_DB:-}" ]]; then
    echo "[deploy] Missing DATABASE_URL and required POSTGRES_* variables in .env" >&2
    exit 1
  fi
  DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"
  set_env_var "${ENV_FILE}" "DATABASE_URL" "${DATABASE_URL}"
  echo "[deploy] Set missing DATABASE_URL in .env"
fi

NORMALIZED_DATABASE_URL="$(normalize_database_url "${DATABASE_URL}")"
if [[ "${NORMALIZED_DATABASE_URL}" != "${DATABASE_URL}" ]]; then
  set_env_var "${ENV_FILE}" "DATABASE_URL" "${NORMALIZED_DATABASE_URL}"
  DATABASE_URL="${NORMALIZED_DATABASE_URL}"
  echo "[deploy] Normalized DATABASE_URL host to postgres:5432 for Docker networking"
fi

mkdir -p "${ROOT_DIR}/backups"
BACKUP_FILE="${ROOT_DIR}/backups/${POSTGRES_DB:-mood}_$(date +%F_%H%M%S).dump"

if [[ "${SKIP_BACKUP}" != "1" ]]; then
  if [[ -n "$(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps -q postgres)" ]]; then
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T postgres \
      pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc > "${BACKUP_FILE}"
    echo "[deploy] Backup written to ${BACKUP_FILE}"
  else
    echo "[deploy] Postgres container not running, skipping backup"
  fi
fi

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build web
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate web
sleep "${WAIT_SECONDS}"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps

WEB_PORT_VALUE="${WEB_PORT:-3001}"
HTTP_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "http://localhost:${WEB_PORT_VALUE}/" || true)"
echo "[deploy] GET / -> ${HTTP_STATUS} on http://localhost:${WEB_PORT_VALUE}"
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" logs --tail=60 web

if [[ -n "${STASH_LABEL}" ]]; then
  echo "[deploy] Local changes are saved in stash: ${STASH_LABEL}"
fi
