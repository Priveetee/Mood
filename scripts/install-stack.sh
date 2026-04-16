#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-Priveetee/Mood}"
REF="${REF:-main}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/mood}"
START_DEPLOY=1
PROJECT_NAME_OVERRIDE=""
WEB_PORT_OVERRIDE=""
DB_PORT_OVERRIDE=""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/deploy-common.sh"

usage() {
  cat <<'EOF'
Usage:
  bash install-stack.sh [options]

Options:
  --ref <git-ref>     Git ref to deploy (default: main)
  --dir <path>        Install directory (default: ~/mood)
  --project-name <n>  COMPOSE_PROJECT_NAME override
  --web-port <port>   WEB_PORT override
  --db-port <port>    POSTGRES_PORT override
  --download-only     Clone or update only, skip deploy
  -h, --help          Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ref)
      REF="$2"
      shift 2
      ;;
    --dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --project-name)
      PROJECT_NAME_OVERRIDE="$2"
      shift 2
      ;;
    --web-port)
      WEB_PORT_OVERRIDE="$2"
      shift 2
      ;;
    --db-port)
      DB_PORT_OVERRIDE="$2"
      shift 2
      ;;
    --download-only)
      START_DEPLOY=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[install] Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

need_cmd git
need_cmd curl
need_cmd docker
need_cmd bun

if ! docker compose version >/dev/null 2>&1; then
  echo "[install] docker compose v2 is required" >&2
  exit 1
fi

INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"
if [[ -d "${INSTALL_DIR}/.git" ]]; then
  if ! git -C "${INSTALL_DIR}" diff --quiet || ! git -C "${INSTALL_DIR}" diff --cached --quiet; then
    git -C "${INSTALL_DIR}" stash push -u -m "install-stack-$(date +%F_%H%M%S)" >/dev/null
  fi
  git -C "${INSTALL_DIR}" fetch origin
  git -C "${INSTALL_DIR}" checkout "${REF}"
  git -C "${INSTALL_DIR}" pull --ff-only origin "${REF}"
else
  git clone --branch "${REF}" "https://github.com/${REPO}.git" "${INSTALL_DIR}"
fi

if [[ ! -f "${INSTALL_DIR}/.env" ]]; then
  cp "${INSTALL_DIR}/.env.example" "${INSTALL_DIR}/.env"
  ensure_mood_env_defaults "${INSTALL_DIR}/.env"
else
  apply_mood_env_overrides \
    "${INSTALL_DIR}/.env" \
    "${PROJECT_NAME_OVERRIDE}" \
    "${WEB_PORT_OVERRIDE}" \
    "${DB_PORT_OVERRIDE}"
fi

if [[ "${START_DEPLOY}" == "0" ]]; then
  echo "[install] Download complete at ${INSTALL_DIR}"
  exit 0
fi

bash "${INSTALL_DIR}/scripts/deploy-prod.sh" --stash-dirty --skip-pull --ref "${REF}"
