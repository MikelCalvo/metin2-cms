import "server-only";

import type { RowDataPacket } from "mysql2";

import { getRankingPool } from "@/lib/db/connection";
import { getEnv } from "@/lib/env";

import type { CharacterDetailRow } from "@/server/characters/character-detail-types";

type CharacterDetailRowPacket = RowDataPacket & CharacterDetailRow;

export function hasCharacterDetailDbConfigured() {
  return Boolean(getEnv().PLAYER_DATABASE_URL);
}

export async function findCharacterDetailRowById(characterId: number): Promise<CharacterDetailRow | null> {
  const [rows] = await getRankingPool().query<CharacterDetailRowPacket[]>(
    `SELECT
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
    LIMIT 1`,
    [characterId],
  );

  return rows[0] ?? null;
}
