# Character detail route

This slice adds a public `/characters/[id]` route for one live Metin2 character.

## Goal

Show a fuller public-facing character profile than the compact ladder and account cards, while keeping the implementation read-only against the `player` schema.

## Data source

The route uses the same read-only `PLAYER_DATABASE_URL` connection already used by:
- `/rankings`
- `/account` → `My characters`

## Query shape

The page reads one character from `player.player` by `id` and enriches the row with optional guild context:

```sql
SELECT
  p.id AS id,
  p.name AS name,
  p.job AS job,
  p.level AS level,
  p.exp AS exp,
  p.playtime AS playtime,
  p.gold AS gold,
  p.alignment AS alignment,
  p.last_play AS lastPlay,
  p.map_index AS mapIndex,
  p.x AS x,
  p.y AS y,
  p.hp AS hp,
  p.mp AS mp,
  p.st AS st,
  p.ht AS ht,
  p.dx AS dx,
  p.iq AS iq,
  p.stat_point AS statPoint,
  p.skill_point AS skillPoint,
  p.skill_group AS skillGroup,
  p.sub_skill_point AS subSkillPoint,
  p.horse_level AS horseLevel,
  p.horse_hp AS horseHp,
  p.horse_stamina AS horseStamina,
  p.stat_reset_count AS statResetCount,
  g.id AS guildId,
  g.name AS guildName,
  gm.grade AS guildGrade,
  gm.is_general AS guildIsGeneral,
  g.master AS guildMasterId
FROM player p
LEFT JOIN guild_member gm ON gm.pid = p.id
LEFT JOIN guild g ON g.id = gm.guild_id
WHERE p.id = ?
LIMIT 1
```

## Public route behavior

For a valid character, the route shows:
- class
- level
- EXP
- playtime
- Yang
- alignment
- HP / MP
- base stats (`st`, `ht`, `dx`, `iq`)
- stat / skill point state
- map + coordinates
- last seen
- guild + guild role
- horse summary

## Failure behavior

- invalid ids → `404`
- missing character row → `404`
- missing `PLAYER_DATABASE_URL` → compact unavailable state
- query failure → compact unavailable state + server log

## Linking rules

The public character route should be reachable from:
- player names in `/rankings`
- player names in `/account` → `My characters`

This keeps the feature discoverable without inventing a second navigation surface.
