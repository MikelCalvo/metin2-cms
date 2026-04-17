# Integration testing for legacy auth

This repository now keeps two levels of automated verification:

1. unit tests
2. MariaDB-backed integration tests for the legacy auth slice

## Scope covered right now

Current integration coverage proves:
- a new account can be registered into `account_test.account`
- the stored password uses the legacy `PASSWORD()`-compatible hash flow
- the same credentials can log in through the service layer
- a web session can be persisted into `metin2_cms_test.web_sessions`

Current test file:
- `tests/integration/auth/auth-flow.integration.test.ts`

## Databases used in tests

The integration layer never points at the live server databases.

It uses isolated schemas:
- `account_test`
- `metin2_cms_test`

## Local workflow on metin2server

Reset and prepare local test schemas:

```bash
pnpm db:test:reset:local
```

That script:
- recreates `account_test`
- recreates `metin2_cms_test`
- recreates test-only local users
- writes `.env.test.local`

Run the integration suite locally:

```bash
pnpm test:integration:local
```

## CI workflow

GitHub Actions job:
- `integration-mariadb`

It starts a temporary MariaDB 11.8 service and uses:
- `TEST_DATABASE_ADMIN_URL`
- `DATABASE_URL`
- `CMS_DATABASE_URL`

Reset step:

```bash
pnpm db:test:reset
```

This uses:
- `scripts/reset-test-databases.mjs`
- `sql/test/account-test-schema.sql`
- `drizzle/0000_auth_tables.sql`

## Why two reset paths exist

There are two reset entrypoints on purpose:

1. `scripts/reset-test-databases.mjs`
   - portable
   - used by CI
   - expects an admin connection URL via env

2. `scripts/reset-test-databases-local.sh`
   - convenient for this FreeBSD host
   - uses the local `mariadb` CLI as root via socket auth
   - regenerates `.env.test.local`

## Important safety rule

Do not point integration env vars at the live schemas:
- never use production `account`
- never use production `metin2_cms`

Only use:
- `account_test`
- `metin2_cms_test`
