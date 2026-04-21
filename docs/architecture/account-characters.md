# Account characters inside `/account`

This slice adds a read-only `My characters` section to the authenticated account area.

## Goal

Show the live Metin2 characters that belong to the authenticated legacy account without writing anything into the `player` schema.

## Data source

The feature uses the existing read-only `PLAYER_DATABASE_URL` connection.

Observed schema currently available through that connection:
- `player`
- `guild`
- `guild_member`

There is no friend/messenger table on this connection, so this slice is intentionally limited to characters.

## Query shape

Characters are loaded by `account_id` from `player.player` and optionally enriched with guild name:

```sql
SELECT
  p.id AS id,
  p.name AS name,
  p.job AS job,
  p.level AS level,
  p.exp AS exp,
  p.playtime AS playtime,
  p.last_play AS lastPlay,
  g.name AS guildName
FROM player p
LEFT JOIN (
  SELECT gm.pid AS pid, MAX(gm.guild_id) AS guild_id
  FROM guild_member gm
  GROUP BY gm.pid
) gm ON gm.pid = p.id
LEFT JOIN guild g ON g.id = gm.guild_id
WHERE p.account_id = ? AND p.name <> ''
ORDER BY p.level DESC, p.exp DESC, p.playtime DESC, p.id ASC
```

## UI behavior

`/account` now shows a dedicated `My characters` section with one card per character:
- character name
- class label
- level
- playtime
- guild
- last seen

## Failure behavior

This slice must never break `/account`.

If `PLAYER_DATABASE_URL` is missing:
- show a calm unavailable state in the characters section
- keep the rest of `/account` working

If the query fails:
- log the failure server-side
- show a temporary unavailable message in the characters section
- keep the rest of `/account` working

If the account has no characters yet:
- show an empty state instead of a broken panel
