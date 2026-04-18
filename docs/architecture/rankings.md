# Rankings architecture

This document describes the first live ranking slice implemented in the modern Metin2 CMS.

## Goal

Expose read-only ladders from the live game data without coupling the ranking route to auth/session logic or to later item shop write paths.

## Route

- `/rankings`

The route is intentionally server-rendered on demand.

## Data source

The first ranking slice reads from the live `player` schema through a dedicated read-only MariaDB connection configured by:

- `PLAYER_DATABASE_URL`

Important:
- `PLAYER_DATABASE_URL` should use a read-only user
- it should not reuse the auth write credentials
- host-specific values stay outside the repository

## Queried tables

### Character ladder
- `player.player`
- `player.guild_member`
- `player.guild`

### Guild ladder
- `player.guild`

## Character ranking order

Characters are ordered by:
1. `level` descending
2. `exp` descending
3. `playtime` descending
4. `id` ascending as a stable final tie-breaker

Current visible fields:
- rank
- character name
- class label derived from `job`
- level
- experience
- playtime
- guild name when present
- `last_play`

## Guild ranking order

Guilds are ordered by:
1. `ladder_point` descending
2. `level` descending
3. `exp` descending
4. `id` ascending as a stable final tie-breaker

Current visible fields:
- rank
- guild name
- ladder points
- level
- war record (`win`-`draw`-`loss`)

## Why a dedicated ranking connection exists

The auth stack currently uses:
- `DATABASE_URL` for `account`
- `CMS_DATABASE_URL` for `metin2_cms`

The auth database user does not automatically have access to the `player` schema, and it should not be expanded casually.

Using a dedicated read-only ranking connection keeps:
- least privilege
- cleaner operational boundaries
- safer future evolution for item shop and admin tooling

## Future improvements

Likely next extensions:
- player filters or segmented ladders
- guild detail pages
- character detail pages
- empire/class filters if the real schema and product rules justify them
- staff/test account exclusion rules if the product wants them
