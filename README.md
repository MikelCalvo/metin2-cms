# metin2-cms

Modern CMS and item shop for Metin2 servers, built with Next.js, TypeScript and SSR.

## Goal

This repository is the modern web platform for the Metin2 server environment in this lab.

The first product slice is intentionally small:
- login
- register
- account session handling

Later slices can expand into:
- account area
- rankings
- downloads
- item shop
- admin tooling

## Technical direction

Current bootstrap decisions:
- Next.js App Router
- TypeScript
- pnpm
- Tailwind CSS
- Drizzle ORM + mysql2
- server-first architecture

## Auth source of truth

The live game database is the source of truth for identity.

Read-only inspection on `metin2server` confirmed that the active account table is `account.account`, with legacy-compatible fields such as:
- `login`
- `password`
- `social_id`
- `email`
- `status`
- `cash`
- `mileage`

Important:
- the live schema does not expose `real_name`
- the live schema does not expose `coins`
- current passwords are stored in a legacy 41-character `PASSWORD()`-style hash format

Because of that, the CMS must be designed around the real running DB contract, not around assumptions from old PHP CMS codebases.

## Architecture boundary

The repository will keep two data domains clearly separated:

1. Legacy game-owned data
- `account.account` remains the identity source of truth

2. CMS-owned data
- web sessions
- auth audit logs
- token/recovery state
- later, item shop and operational tables

## Local development

Required baseline:
- Node.js `22.22.2`
- pnpm `10.33.0`

FreeBSD note:
- Next.js 16 does not ship a native SWC binary for `freebsd/x64`
- this repository installs `@next/swc-wasm-nodejs` and links it during `postinstall`
- local `dev` and `build` scripts use `--webpack` so the project works on FreeBSD

Environment note:
- unit tests and `pnpm build` do not require a live MariaDB connection anymore
- the DB env is resolved lazily when auth/account code actually touches the database
- CI injects placeholder URLs so GitHub Actions does not fail on missing env config
- real login/register/recovery runtime still requires valid `DATABASE_URL` and `CMS_DATABASE_URL`
- recovery delivery is temporary for now:
  - non-production defaults to `RECOVERY_DELIVERY_MODE=preview`
  - production defaults to `RECOVERY_DELIVERY_MODE=file`
  - file mode writes manual-delivery JSON payloads under `.runtime/recovery-outbox` unless `RECOVERY_FILE_OUTBOX_DIR` overrides it
  - `RECOVERY_DELIVERY_MODE=preview` is blocked in production on purpose
- an integration job now boots a temporary MariaDB service in GitHub Actions and resets `account_test` + `metin2_cms_test`
- a local reset helper exists at `scripts/reset-test-databases-local.sh`
- integration helpers and reset scripts refuse to touch non-`*_test` schemas

Before using login/register locally, provision the CMS-owned tables in the CMS database.
A ready-to-apply SQL file lives at:
- `drizzle/0000_auth_tables.sql`

Integration test assets:
- account test schema: `sql/test/account-test-schema.sql`
- CI/local admin reset script: `scripts/reset-test-databases.mjs`
- local FreeBSD reset script: `scripts/reset-test-databases-local.sh`
- integration tests: `tests/integration/auth/auth-flow.integration.test.ts`

Main routes after this auth slice:
- `/login`
- `/register`
- `/recover`
- `/reset-password`
- `/account`

Main commands:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm db:test:reset:local
pnpm test:integration:local
pnpm build
```

## Status

Current phase:
- legacy-compatible login/register implemented
- login attempts now write `auth_audit_log` entries and are rate-limited per login after repeated failures
- password recovery slice implemented with CMS-owned tokens
- temporary recovery delivery modes in place (`preview` for dev, `file` for production)
- recovery requests now write `auth_audit_log` entries and are rate-limited per login
- `/account` now shows active CMS sessions and can close the other sessions for the same account
- `/account` now supports revoking one specific non-current CMS session
- `/account` now shows the most recent auth activity for the account from `auth_audit_log`
- `/account` now surfaces a security summary with active session count plus the latest successful sign-in, sign-in issue and recovery event
- `/account` now lets the authenticated user change the legacy-compatible password and revokes the other CMS sessions after a successful update
- `/account` now lets the authenticated user update the legacy account email and delete code from the protected area
- the current CMS session now refreshes `last_seen_at` when protected areas load
- unit verification in place
- MariaDB-backed integration verification in place for register/login/recovery + CMS session persistence

Next implementation phase after this slice:
- richer account area
- rankings and itemshop slices
