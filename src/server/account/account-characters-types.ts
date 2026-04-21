import type { RankingTimestamp } from "@/server/rankings/types";

export type AccountCharacterRow = {
  id: number;
  name: string;
  job: number;
  level: number;
  exp: number;
  playtime: number;
  lastPlay: RankingTimestamp;
  guildName: string | null;
};

export type AccountCharacter = AccountCharacterRow & {
  classLabel: string;
};

export type AccountCharactersOverview =
  | {
      status: "available";
      characters: AccountCharacter[];
    }
  | {
      status: "unavailable";
      reason: "not_configured" | "query_failed";
      message: string;
    };
