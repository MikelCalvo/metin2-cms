# Account My Characters Implementation Plan

> **For Hermes:** implement this slice with the existing `/account` dashboard structure, the read-only `PLAYER_DATABASE_URL` connection, and no writes into the legacy `player` schema.

**Goal:** show the authenticated user's live Metin2 characters inside `/account`.

**Architecture:** keep `/account` as the authenticated account/security surface, but add a dedicated read-only `My characters` section sourced from `player.player` by `account_id`. Reuse the existing player-schema connection pattern from rankings and keep graceful fallbacks when `PLAYER_DATABASE_URL` is missing or the query fails.

**Tech Stack:** Next.js App Router, TypeScript, mysql2, existing ranking/account formatters, shadcn/ui cards/alerts.

---

## Planned touch points

- Create `src/server/account/account-characters-types.ts`
- Create `src/server/account/account-characters-repository.ts`
- Create `src/server/account/account-characters-service.ts`
- Create `src/components/account/account-character-card.tsx`
- Modify `src/app/account/page.tsx`
- Modify `src/lib/i18n/messages.ts`
- Modify `tests/unit/account/account-page.test.ts`
- Create `tests/unit/account/account-characters-service.test.ts`
- Modify `README.md`

## Behavior to ship

1. Query `player.player` rows for the authenticated `account.id`.
2. Join optional guild name through `guild_member` + `guild`.
3. Order characters by `level DESC, exp DESC, playtime DESC, id ASC`.
4. Render a `My characters` section in `/account` with:
   - character name
   - class label
   - level
   - playtime
   - guild
   - last seen
5. If there are no characters, show a calm empty state.
6. If the player DB is unavailable, keep `/account` working and show a non-fatal unavailable state.

## Verification approach for this session

- Add tests first in the repo to document expected behavior.
- Do **not** run build/manual test commands in this session unless the user asks explicitly.
- Review the final diff carefully and report any unexecuted verification steps.
