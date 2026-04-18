#!/bin/sh
set -eu

ZERO_SHA="0000000000000000000000000000000000000000"
REPO_DIR="$(git rev-parse --show-toplevel)"
REMOTE="${1:-origin}"
BRANCH="${2:-$(git branch --show-current)}"

if [ "${BRANCH}" != "main" ]; then
  echo "push-and-deploy only supports the main branch" >&2
  exit 1
fi

cd "${REPO_DIR}"

if [ -n "$(git status --short)" ]; then
  echo "Refusing push-and-deploy: repository is dirty" >&2
  exit 1
fi

LOCAL_SHA="$(git rev-parse "${BRANCH}")"
REMOTE_URL="$(git remote get-url "${REMOTE}")"
REMOTE_SHA="$(git ls-remote --heads "${REMOTE}" "${BRANCH}" | awk 'NR == 1 { print $1 }')"
REMOTE_SHA="${REMOTE_SHA:-$ZERO_SHA}"


git push "${REMOTE}" "${BRANCH}"

printf 'refs/heads/%s %s refs/heads/%s %s\n' \
  "${BRANCH}" \
  "${LOCAL_SHA}" \
  "${BRANCH}" \
  "${REMOTE_SHA}" \
  | /usr/local/bin/node "${REPO_DIR}/scripts/post-push-deploy.mjs" "${REMOTE}" "${REMOTE_URL}"
