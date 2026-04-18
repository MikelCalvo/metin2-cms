export type PlayerRankingRow = {
  id: number;
  name: string;
  level: number;
  exp: number;
  playtime: number;
  job: number;
  lastPlay: string;
  guildName: string | null;
};

export type GuildRankingRow = {
  id: number;
  name: string;
  level: number | null;
  exp: number | null;
  ladderPoint: number;
  win: number;
  draw: number;
  loss: number;
};

export type PlayerRankingEntry = PlayerRankingRow & {
  rank: number;
  classLabel: string;
};

export type GuildRankingEntry = GuildRankingRow & {
  rank: number;
};

export type RankingOverview =
  | {
      status: "available";
      players: PlayerRankingEntry[];
      guilds: GuildRankingEntry[];
    }
  | {
      status: "unavailable";
      reason: "not_configured" | "query_failed";
      message: string;
    };
