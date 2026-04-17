#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

CMS_TEST_PASSWORD=$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(18))
PY
)
LEGACY_TEST_PASSWORD=$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(18))
PY
)

mariadb <<SQL
DROP DATABASE IF EXISTS \`metin2_cms_test\`;
DROP DATABASE IF EXISTS \`account_test\`;
CREATE DATABASE \`account_test\` CHARACTER SET ascii COLLATE ascii_general_ci;
CREATE DATABASE \`metin2_cms_test\` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
CREATE USER IF NOT EXISTS 'metin2_cms_test_app'@'127.0.0.1' IDENTIFIED BY '${CMS_TEST_PASSWORD}';
CREATE USER IF NOT EXISTS 'metin2_cms_test_app'@'localhost' IDENTIFIED BY '${CMS_TEST_PASSWORD}';
CREATE USER IF NOT EXISTS 'metin2_cms_test_legacy_auth'@'127.0.0.1' IDENTIFIED BY '${LEGACY_TEST_PASSWORD}';
CREATE USER IF NOT EXISTS 'metin2_cms_test_legacy_auth'@'localhost' IDENTIFIED BY '${LEGACY_TEST_PASSWORD}';
ALTER USER 'metin2_cms_test_app'@'127.0.0.1' IDENTIFIED BY '${CMS_TEST_PASSWORD}';
ALTER USER 'metin2_cms_test_app'@'localhost' IDENTIFIED BY '${CMS_TEST_PASSWORD}';
ALTER USER 'metin2_cms_test_legacy_auth'@'127.0.0.1' IDENTIFIED BY '${LEGACY_TEST_PASSWORD}';
ALTER USER 'metin2_cms_test_legacy_auth'@'localhost' IDENTIFIED BY '${LEGACY_TEST_PASSWORD}';
GRANT ALL PRIVILEGES ON \`metin2_cms_test\`.* TO 'metin2_cms_test_app'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`metin2_cms_test\`.* TO 'metin2_cms_test_app'@'localhost';
GRANT ALL PRIVILEGES ON \`account_test\`.* TO 'metin2_cms_test_legacy_auth'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`account_test\`.* TO 'metin2_cms_test_legacy_auth'@'localhost';
FLUSH PRIVILEGES;
SQL

mariadb account_test < "$PROJECT_ROOT/sql/test/account-test-schema.sql"
for sql_file in "$PROJECT_ROOT"/drizzle/*.sql; do
  mariadb metin2_cms_test < "$sql_file"
done

cat > "$PROJECT_ROOT/.env.test.local" <<EOF
DATABASE_URL=mysql://metin2_cms_test_legacy_auth:${LEGACY_TEST_PASSWORD}@127.0.0.1:3306/account_test
CMS_DATABASE_URL=mysql://metin2_cms_test_app:${CMS_TEST_PASSWORD}@127.0.0.1:3306/metin2_cms_test
SESSION_COOKIE_NAME=mt2cms_test_session
SESSION_COOKIE_SECURE=false
APP_BASE_URL=http://127.0.0.1:3000
EOF

chmod 600 "$PROJECT_ROOT/.env.test.local"

echo "Reset complete: account_test + metin2_cms_test"
echo "Wrote $PROJECT_ROOT/.env.test.local"
