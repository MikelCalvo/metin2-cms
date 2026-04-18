import "server-only";

import type { RowDataPacket } from "mysql2";

import { getRankingPool } from "@/lib/db/connection";
import { getEnv } from "@/lib/env";

import type { GuildRankingRow, PlayerRankingRow } from "@/server/rankings/types";

type PlayerRankingRowPacket = RowDataPacket & PlayerRankingRow;
type GuildRankingRowPacket = RowDataPacket & GuildRankingRow;

const DEFAULT_PLAYER_RANKING_LIMIT = 100;
const DEFAULT_GUILD_RANKING_LIMIT = 10;

export function hasPlayerRankingDbConfigured() {
  return Boolean(getEnv().PLAYER_DATABASE_URL);
}

export async function listTopPlayerRankingRows(limit = DEFAULT_PLAYER_RANKING_LIMIT) {
  const [rows] = await getRankingPool().query<PlayerRankingRowPacket[]>(
    `SELECT
      p.id AS id,
      p.name AS name,
      p.level AS level,
      p.exp AS exp,
      p.playtime AS playtime,
      p.job AS job,
      p.last_play AS lastPlay,
      g.name AS guildName
    FROM player p
    LEFT JOIN (
      SELECT gm.pid AS pid, MAX(gm.guild_id) AS guild_id
      FROM guild_member gm
      GROUP BY gm.pid
    ) gm ON gm.pid = p.id
    LEFT JOIN guild g ON g.id = gm.guild_id
    WHERE p.name <> '' AND p.level > 0
    ORDER BY p.level DESC, p.exp DESC, p.playtime DESC, p.id ASC
    LIMIT ?`,
    [limit],
  );

  return rows;
}

export async function listTopGuildRankingRows(limit = DEFAULT_GUILD_RANKING_LIMIT) {
  const [rows] = await getRankingPool().query<GuildRankingRowPacket[]>(
    `SELECT
      g.id AS id,
      g.name AS name,
      g.level AS level,
      g.exp AS exp,
      g.ladder_point AS ladderPoint,
      g.win AS win,
      g.draw AS draw,
      g.loss AS loss
    FROM guild g
    WHERE g.name <> ''
    ORDER BY g.ladder_point DESC, g.level DESC, g.exp DESC, g.id ASC
    LIMIT ?`,
    [limit],
  );

  return rows;
}
