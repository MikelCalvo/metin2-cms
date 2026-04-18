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
- live rankings runtime additionally requires `PLAYER_DATABASE_URL`
- `PLAYER_DATABASE_URL` should point to a read-only MariaDB user for the `player` schema, not to the auth or CMS write credentials
- private starter-pack delivery can be enabled with `STARTER_PACK_URL`
- `STARTER_PACK_URL` is intentionally optional and should stay in environment configuration, not in committed source
- when configured, `/downloads` exposes a CMS-owned `/downloads/client` redirect so the page markup does not need to embed the backing distribution URL directly
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

## Production service and deploy flow

The deployed CMS runs continuously through a FreeBSD `rc.d` service:
- service name: `metin2_cms`
- port: `3000`
- runtime entrypoint: `/opt/metin2/runtime/metin2-cms/start.sh`

The runtime service serves the production Next.js build from this same working tree.
That means a source change is not public until a fresh build is generated and the service is restarted.
Host-specific domains, remotes and access details are intentionally kept out of this repository.

### Auto deploy after a successful push from this server

This repository includes a local push-and-deploy flow for the production working tree:
- push wrapper: `scripts/push-and-deploy.sh`
- git alias: `git push-deploy`
- deploy decision runner: `scripts/post-push-deploy.mjs`
- deploy script: `scripts/deploy-local.sh`
- deploy log: `/opt/metin2/logs/metin2-cms-deploy.log`

Behavior:
- use `git push-deploy origin main` (or `scripts/push-and-deploy.sh origin main`) for production pushes from this host
- the wrapper pushes first and only starts the deploy if `git push` succeeds
- only pushes to `origin` that update `main` trigger a deploy
- the remote URL is validated against the currently configured local `origin` remote instead of a hardcoded repository URL
- dependency install runs automatically only when `package.json`, `pnpm-lock.yaml` or `pnpm-workspace.yaml` changed
- deploys are serialized with a lock file so two pushes cannot overlap build/restart work
- every triggered deploy runs `pnpm build`, restarts `metin2_cms`, and waits for the local `/login` healthcheck on port `3000`
- the deploy script refuses to run if the repo is dirty or if `HEAD` does not match the pushed commit SHA
- remote URLs are sanitized before they are written to the deploy log

Local repo configuration on the server uses:

```bash
git config alias.push-deploy '!sh scripts/push-and-deploy.sh'
```

### Manual deploy

If a manual redeploy is needed on the server:

```bash
scripts/deploy-local.sh --sha="$(git rev-parse HEAD)"
```

Add `--install-deps` when the dependency manifests changed.

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
- shadcn/ui is now installed as the CMS component primitive layer
- authenticated surfaces now use a darker modern dashboard/auth visual language instead of the original plain white milestone layout
- `/account` now groups profile, game account, security center and recent activity with a stronger hierarchy
- the public landing page and auth entry routes now share reusable CMS shells instead of standalone one-off wrappers
- the private web foundation now includes shared site navigation plus dedicated `/game`, `/downloads`, `/getting-started` and `/rankings` routes
- `/downloads` and `/getting-started` now document the private client delivery and onboarding flow without embedding host-specific URLs in the repository
- `/downloads` can now expose a live starter-pack CTA through `STARTER_PACK_URL`, using `/downloads/client` as the stable CMS-owned redirect path
- `/rankings` now reads live character and guild ladder data from the `player` schema through a dedicated read-only database connection
- ranking ordering is now documented in `docs/architecture/rankings.md`
- `git push-deploy origin main` from the production working tree now pushes first and then rebuilds/restarts `metin2_cms`
- `/account` now surfaces a security summary with active session count plus the latest successful sign-in, sign-in issue and latest account change
- `/account` now lets the authenticated user change the legacy-compatible password and revokes the other CMS sessions after a successful update
- `/account` now lets the authenticated user update the legacy account email and delete code from the protected area
- the current CMS session now refreshes `last_seen_at` when protected areas load
- unit verification in place
- MariaDB-backed integration verification in place for register/login/recovery + CMS session persistence

Roadmap reference:
- `docs/plans/2026-04-18-web-product-roadmap.md`

Next implementation order after this slice:
- item shop foundation and purchase audit model
- admin/editorial tooling
