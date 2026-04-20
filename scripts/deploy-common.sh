#!/usr/bin/env bash

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[deploy] Missing required command: $1" >&2
    exit 1
  fi
}

read_env_value() {
  local env_file="$1"
  local key="$2"
  local value
  value="$(grep -E "^${key}=" "${env_file}" | head -n1 | cut -d= -f2- || true)"
  value="${value%\"}"
  value="${value#\"}"
  printf '%s' "${value}"
}

set_env_var() {
  local env_file="$1"
  local key="$2"
  local value="$3"
  if grep -qE "^${key}=" "${env_file}"; then
    sed -i "s|^${key}=.*$|${key}=${value}|" "${env_file}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${env_file}"
  fi
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 32 | tr -d '\n'
    return
  fi
  bun --eval "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
}

normalize_database_url() {
  local current_url="$1"
  printf '%s' "${current_url}" | sed -E \
    -e 's#@localhost:[0-9]+/#@postgres:5432/#' \
    -e 's#@127\.0\.0\.1:[0-9]+/#@postgres:5432/#' \
    -e 's#@localhost/#@postgres:5432/#' \
    -e 's#@127\.0\.0\.1/#@postgres:5432/#'
}

ensure_mood_env_defaults() {
  local env_file="$1"
  local web_port pg_port pg_user pg_pass pg_db app_url auth_url invite_key auth_secret jwt_secret
  web_port="$(read_env_value "${env_file}" "WEB_PORT")"
  pg_port="$(read_env_value "${env_file}" "POSTGRES_PORT")"
  pg_user="$(read_env_value "${env_file}" "POSTGRES_USER")"
  pg_pass="$(read_env_value "${env_file}" "POSTGRES_PASSWORD")"
  pg_db="$(read_env_value "${env_file}" "POSTGRES_DB")"
  app_url="$(read_env_value "${env_file}" "NEXT_PUBLIC_APP_URL")"
  auth_url="$(read_env_value "${env_file}" "BETTER_AUTH_URL")"
  invite_key="$(read_env_value "${env_file}" "INVITATION_KEY")"
  auth_secret="$(read_env_value "${env_file}" "BETTER_AUTH_SECRET")"
  jwt_secret="$(read_env_value "${env_file}" "JWT_SECRET")"

  web_port="${web_port:-3001}"
  pg_port="${pg_port:-5450}"
  pg_user="${pg_user:-mood_user}"
  pg_pass="${pg_pass:-password}"
  pg_db="${pg_db:-mood_db}"
  app_url="${app_url:-http://localhost:${web_port}}"
  auth_url="${auth_url:-http://localhost:${web_port}}"

  if [[ -z "${invite_key}" || "${invite_key}" == replace_with_invitation_secret ]]; then
    invite_key="$(generate_secret)"
  fi
  if [[ -z "${auth_secret}" || "${auth_secret}" == replace_with_long_random_auth_secret ]]; then
    auth_secret="$(generate_secret)"
  fi
  if [[ -z "${jwt_secret}" || "${jwt_secret}" == replace_with_long_random_secret ]]; then
    jwt_secret="$(generate_secret)"
  fi

  set_env_var "${env_file}" "WEB_PORT" "${web_port}"
  set_env_var "${env_file}" "POSTGRES_PORT" "${pg_port}"
  set_env_var "${env_file}" "POSTGRES_USER" "${pg_user}"
  set_env_var "${env_file}" "POSTGRES_PASSWORD" "${pg_pass}"
  set_env_var "${env_file}" "POSTGRES_DB" "${pg_db}"
  set_env_var "${env_file}" "EXPECTED_DATABASE_NAME" "${pg_db}"
  set_env_var "${env_file}" "BETTER_AUTH_URL" "${auth_url}"
  set_env_var "${env_file}" "NEXT_PUBLIC_APP_URL" "${app_url}"
  set_env_var "${env_file}" "INVITATION_KEY" "${invite_key}"
  set_env_var "${env_file}" "BETTER_AUTH_SECRET" "${auth_secret}"
  set_env_var "${env_file}" "JWT_SECRET" "${jwt_secret}"
  set_env_var "${env_file}" "DRAGONFLY_URL" "redis://dragonfly:6379"
  set_env_var "${env_file}" "DATABASE_URL" "postgresql://${pg_user}:${pg_pass}@postgres:5432/${pg_db}"
}

apply_mood_env_overrides() {
  local env_file="$1"
  local project_name_override="$2"
  local web_port_override="$3"
  local db_port_override="$4"
  local web_port

  if [[ -n "${project_name_override}" ]]; then
    set_env_var "${env_file}" "COMPOSE_PROJECT_NAME" "${project_name_override}"
  fi
  if [[ -n "${db_port_override}" ]]; then
    set_env_var "${env_file}" "POSTGRES_PORT" "${db_port_override}"
  fi
  if [[ -n "${web_port_override}" ]]; then
    web_port="${web_port_override}"
    set_env_var "${env_file}" "WEB_PORT" "${web_port}"
    set_env_var "${env_file}" "BETTER_AUTH_URL" "http://localhost:${web_port}"
    set_env_var "${env_file}" "NEXT_PUBLIC_APP_URL" "http://localhost:${web_port}"
  fi
}

create_postgres_backup() {
  local env_file="$1"
  local compose_file="$2"
  local backup_dir="$3"
  local pg_user="$4"
  local pg_db="$5"

  local stamp backup_file tmp_file
  stamp="$(date -u +%Y%m%d_%H%M%S)"
  mkdir -p "${backup_dir}"
  backup_file="${backup_dir}/${pg_db}_${stamp}.dump"
  tmp_file="${backup_file}.tmp"

  if [[ -z "$(docker compose --env-file "${env_file}" -f "${compose_file}" ps -q postgres)" ]]; then
    echo "[deploy] Postgres container not running, skipping backup" >&2
    return 0
  fi

  docker compose --env-file "${env_file}" -f "${compose_file}" exec -T postgres \
    pg_dump -U "${pg_user}" -d "${pg_db}" -Fc > "${tmp_file}"

  if [[ ! -s "${tmp_file}" ]]; then
    rm -f "${tmp_file}"
    echo "[deploy] Backup failed: generated dump is empty" >&2
    return 1
  fi

  mv "${tmp_file}" "${backup_file}"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${backup_file}" > "${backup_file}.sha256"
  fi

  printf '%s' "${backup_file}"
}
