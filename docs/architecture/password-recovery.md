# Password recovery slice

This document describes the first password-recovery implementation for the Metin2 CMS.

## Current shape

The slice is intentionally small and server-first:

1. user submits login + email on `/recover`
2. CMS checks the legacy `account.account` record
3. if the pair matches an `OK` account, the CMS stores a one-time recovery token in `metin2_cms.password_recovery_tokens`
4. user lands on `/reset-password?token=...`
5. CMS verifies the token, hashes the new password with the legacy MariaDB `PASSWORD()`-compatible flow, updates `account.account.password`, consumes the token, and revokes active CMS sessions for that account

## Data ownership

Legacy DB write:
- `account.account.password`

CMS DB writes:
- `password_recovery_tokens`
- session revocation in `web_sessions`

## Security notes

- recovery tokens are stored hashed with SHA-256, not in plaintext
- reset tokens are one-time use through `consumed_at`
- reset tokens are time-limited
- request flow returns a generic success message even when login/email do not match, reducing account enumeration
- integration tooling refuses to point at non-`*_test` schemas

## Current limitation

There is no outbound email delivery yet.

For now, when not running in production mode, the request flow exposes a development preview reset URL so the feature can be tested end-to-end before mail delivery is wired.

## Next upgrade paths

Likely follow-ups:
- email delivery integration
- request throttling / abuse controls
- auth audit log entries for recovery request/reset events
- cleanup job for expired tokens
- optional forced invalidation of game-side sessions if the legacy stack exposes them
