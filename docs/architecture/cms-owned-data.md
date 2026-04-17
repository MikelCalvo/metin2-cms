# CMS-owned data boundaries

This repository must keep a strict separation between legacy game-owned data and web-owned data.

## Game-owned data

Source of truth for identity remains the live Metin2 account database.

Current example:
- `account.account`

What belongs there:
- login
- password hash
- delete code / `social_id`
- email
- account status
- legacy balances such as `cash` and `mileage`

## CMS-owned data

The CMS should own web-specific state that the legacy server never needed to model directly.

Initial tables reserved in this repository:
- `web_sessions`
- `auth_audit_log`

Likely future CMS-owned tables:
- password recovery tokens
- email verification tokens
- item shop catalog overlays
- order/payment/audit tables
- admin/operator audit tables

## Why this boundary matters

If we put web-only concerns directly into the legacy account table, we create several problems:
- tighter coupling to legacy serverfiles
- harder future migrations
- more risk when touching auth-critical data
- poorer auditability

By separating ownership:
- the game account table remains compatible with the current server
- the CMS can evolve its own session/audit model safely
- we keep a clear line between compatibility code and product code

## Recommended deployment shape

Preferred setup:
- same MariaDB instance
- separate CMS database/schema, for example `metin2_cms`

That is why the environment contract distinguishes:
- `DATABASE_URL` for the legacy account database
- `CMS_DATABASE_URL` for CMS-owned tables

## Write-path rules

### The new CMS may write to `account.account` only for:
- register account
- update auth-relevant account data when explicitly intended
- read balances/account status for the authenticated user

### The new CMS should write to CMS-owned tables for:
- web session creation and revocation
- auth attempt logging
- future recovery/verification workflows
- operational and item shop workflows

## Naming guidance

Inside application code, prefer domain names that make the ownership explicit.

Examples:
- `legacyAccountDb`
- `cmsDb`
- `cashBalance`
- `mileageBalance`
- `webSession`
- `authAuditLog`

Avoid ambiguous names like:
- `coins`
- `userTable`
- `sessionTable`

unless they map clearly to a specific DB boundary.
