# Character Detail Route Implementation Plan

> **For Hermes:** implement a public `/characters/[id]` route using the same read-only `PLAYER_DATABASE_URL` data boundary as rankings and account characters.

**Goal:** show a full public-facing detail page for one Metin2 character.

**Architecture:** keep the feature read-only and isolate it under a dedicated `src/server/characters/` service boundary. Reuse localized class-label and timestamp helpers from rankings, and keep the page resilient: invalid IDs or missing characters should resolve to 404, while missing DB config or query failures should render a compact unavailable state without crashing the route.

**Tech Stack:** Next.js App Router, TypeScript, mysql2, existing CMS public shell, existing ranking/account formatting helpers.

---

## Planned scope

- Add `/characters/[id]` as a public route.
- Query one character from `player.player` by `id`.
- Enrich with optional guild membership through `guild_member` + `guild`.
- Show a richer sheet of data than rankings/account cards:
  - class
  - level
  - EXP
  - playtime
  - gold
  - alignment
  - HP / MP
  - base stats (`st`, `ht`, `dx`, `iq`)
  - skill-point related fields
  - map + coordinates
  - last seen
  - guild + guild role if present
  - horse summary
- Link into this route from rankings and account character cards.

## Constraints for this session

- Keep the implementation read-only.
- Add tests before implementation code.
- Do **not** run build/test commands in this session unless the user asks explicitly.
- Update markdown docs so the slice is replicable later.
