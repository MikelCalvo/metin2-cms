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
- real login/register runtime still requires valid `DATABASE_URL` and `CMS_DATABASE_URL`

Before using login/register locally, provision the CMS-owned tables in the CMS database.
A ready-to-apply SQL file lives at:
- `drizzle/0000_auth_tables.sql`

Main routes after this auth slice:
- `/login`
- `/register`
- `/account`

Main commands:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Status

Current phase:
- repository bootstrap

Next implementation phase after bootstrap:
- legacy-compatible login/register
