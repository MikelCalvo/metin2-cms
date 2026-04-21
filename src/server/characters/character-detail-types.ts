import type { RankingTimestamp } from "@/server/rankings/types";

export type CharacterDetailRow = {
  id: number;
  name: string;
  job: number;
  level: number;
  exp: number;
  playtime: number;
  gold: number;
  alignment: number;
  lastPlay: RankingTimestamp;
  mapIndex: number;
  x: number;
  y: number;
  hp: number;
  mp: number;
  st: number;
  ht: number;
  dx: number;
  iq: number;
  statPoint: number;
  skillPoint: number;
  skillGroup: number;
  subSkillPoint: number;
  horseLevel: number;
  horseHp: number;
  horseStamina: number;
  statResetCount: number;
  guildId: number | null;
  guildName: string | null;
  guildGrade: number | null;
  guildIsGeneral: number | null;
  guildMasterId: number | null;
};

export type CharacterDetail = CharacterDetailRow & {
  classLabel: string;
  guildRoleLabel: string | null;
  skillGroupLabel: string;
};

export type CharacterDetailResult =
  | {
      status: "available";
      character: CharacterDetail;
    }
  | {
      status: "not_found";
    }
  | {
      status: "unavailable";
      reason: "not_configured" | "query_failed";
      message: string;
    };
