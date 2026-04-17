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
- recovery requests are rate-limited per login through CMS-side audit data
- request/reset outcomes are recorded in `metin2_cms.auth_audit_log`
- integration tooling refuses to point at non-`*_test` schemas

## Current limitation

There is no outbound email provider yet.

For now the recovery slice supports two temporary delivery modes:

1. `preview`
   - default outside production
   - returns the reset URL directly in the UI so the flow can be tested end-to-end

2. `file`
   - default in production
   - writes a JSON payload with the reset URL into a local outbox directory
   - the operator must manually deliver the link out-of-band after verifying the player identity

Configuration:
- `RECOVERY_DELIVERY_MODE=preview|file`
- `RECOVERY_FILE_OUTBOX_DIR=/path/to/outbox` (optional)

Default file outbox path:
- `.runtime/recovery-outbox`

Safety rule:
- `RECOVERY_DELIVERY_MODE=preview` is rejected in production so the reset link is never shown directly to public users

## Next upgrade paths

Likely follow-ups:
- email delivery integration
- cleanup job for expired tokens
- optional forced invalidation of game-side sessions if the legacy stack exposes them
