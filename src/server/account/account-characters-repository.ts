import "server-only";

import type { RowDataPacket } from "mysql2";

import { getRankingPool } from "@/lib/db/connection";
import { getEnv } from "@/lib/env";

import type { AccountCharacterRow } from "@/server/account/account-characters-types";

type AccountCharacterRowPacket = RowDataPacket & AccountCharacterRow;

export function hasAccountCharactersDbConfigured() {
  return Boolean(getEnv().PLAYER_DATABASE_URL);
}

export async function listAccountCharacterRows(accountId: number) {
  const [rows] = await getRankingPool().query<AccountCharacterRowPacket[]>(
    `SELECT
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
    ORDER BY p.level DESC, p.exp DESC, p.playtime DESC, p.id ASC`,
    [accountId],
  );

  return rows;
}
