#!/bin/sh
set -eu

REPO_DIR="/opt/metin2/workspaces/metin2-cms"
LOG_DIR="/opt/metin2/logs"
LOG_FILE="${LOG_DIR}/metin2-cms-deploy.log"
SERVICE_BIN="/usr/sbin/service"
SERVICE_NAME="metin2_cms"
HEALTHCHECK_URL="http://127.0.0.1:3000/login"
LOCK_FILE="/var/run/metin2-cms-deploy.lock"
INSTALL_DEPS="0"
DEPLOY_SHA=""
PREVIOUS_SHA=""
REMOTE_NAME=""
REMOTE_URL=""

if [ "${METIN2_CMS_DEPLOY_LOCK_HELD:-0}" != "1" ]; then
  exec /usr/bin/env METIN2_CMS_DEPLOY_LOCK_HELD=1 lockf -k -t 600 -w "${LOCK_FILE}" "$0" "$@"
fi

for arg in "$@"; do
  case "$arg" in
    --install-deps)
      INSTALL_DEPS="1"
      ;;
    --sha=*)
      DEPLOY_SHA="${arg#--sha=}"
      ;;
    --previous-sha=*)
      PREVIOUS_SHA="${arg#--previous-sha=}"
      ;;
    --remote=*)
      REMOTE_NAME="${arg#--remote=}"
      ;;
    --remote-url=*)
      REMOTE_URL="${arg#--remote-url=}"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

CURRENT_SHA="$(git -C "${REPO_DIR}" rev-parse HEAD)"
if [ -n "${DEPLOY_SHA}" ] && [ "${CURRENT_SHA}" != "${DEPLOY_SHA}" ]; then
  echo "Refusing deploy: HEAD ${CURRENT_SHA} does not match pushed SHA ${DEPLOY_SHA}" >&2
  exit 1
fi

if [ -n "$(git -C "${REPO_DIR}" status --short)" ]; then
  echo "Refusing deploy: repository is dirty" >&2
  exit 1
fi

command -v pnpm >/dev/null 2>&1 || {
  echo "Refusing deploy: pnpm is not available" >&2
  exit 1
}
command -v curl >/dev/null 2>&1 || {
  echo "Refusing deploy: curl is not available" >&2
  exit 1
}

install -d -m 755 "${LOG_DIR}"

{
  printf '\n[%s] Starting metin2-cms deploy\n' "$(date '+%Y-%m-%d %H:%M:%S')"
  printf '  remote=%s\n' "${REMOTE_NAME:-unknown}"
  printf '  remote_url=%s\n' "${REMOTE_URL:-unknown}"
  printf '  previous_sha=%s\n' "${PREVIOUS_SHA:-unknown}"
  printf '  deploy_sha=%s\n' "${DEPLOY_SHA:-unknown}"
  printf '  install_deps=%s\n' "${INSTALL_DEPS}"

  cd "${REPO_DIR}"

  if [ "${INSTALL_DEPS}" = "1" ]; then
    echo "[deploy] Installing dependencies with frozen lockfile"
    pnpm install --frozen-lockfile
  fi

  echo "[deploy] Building production bundle"
  pnpm build

  echo "[deploy] Restarting ${SERVICE_NAME}"
  "${SERVICE_BIN}" "${SERVICE_NAME}" restart

  echo "[deploy] Waiting for healthcheck"
  attempt=1
  while [ "$attempt" -le 15 ]; do
    if curl --connect-timeout 2 --max-time 5 -fsS "${HEALTHCHECK_URL}" >/dev/null 2>&1; then
      echo "[deploy] Healthcheck OK: ${HEALTHCHECK_URL}"
      break
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  if [ "$attempt" -gt 15 ]; then
    echo "[deploy] Healthcheck failed: ${HEALTHCHECK_URL}" >&2
    exit 1
  fi

  echo "[deploy] Service status"
  "${SERVICE_BIN}" "${SERVICE_NAME}" status
  printf '[%s] Deploy completed successfully\n' "$(date '+%Y-%m-%d %H:%M:%S')"
} >> "${LOG_FILE}" 2>&1

echo "metin2-cms deploy completed. See ${LOG_FILE} for details."
