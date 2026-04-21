import "server-only";

import { defaultLocale, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { formatCharacterClassLabel } from "@/server/rankings/rankings-formatters";

import {
  findCharacterDetailRowById,
  hasCharacterDetailDbConfigured,
} from "@/server/characters/character-detail-repository";
import type { CharacterDetailResult, CharacterDetailRow } from "@/server/characters/character-detail-types";

function formatGuildRoleLabel(row: CharacterDetailRow, locale: Locale) {
  const messages = getMessages(locale).characterDetail;

  if (!row.guildName) {
    return null;
  }

  if (row.guildMasterId === row.id) {
    return messages.guildRoles.leader;
  }

  if (row.guildIsGeneral === 1) {
    return messages.guildRoles.general;
  }

  if (typeof row.guildGrade === "number") {
    return messages.guildRoles.grade(row.guildGrade);
  }

  return messages.guildRoles.member;
}

function formatSkillGroupLabel(skillGroup: number, locale: Locale) {
  const messages = getMessages(locale).characterDetail;

  if (skillGroup <= 0) {
    return messages.skillGroupNone;
  }

  return messages.skillGroupLabel(skillGroup);
}

export async function getCharacterDetail(
  characterId: number,
  locale: Locale = defaultLocale,
): Promise<CharacterDetailResult> {
  const messages = getMessages(locale);

  if (!hasCharacterDetailDbConfigured()) {
    return {
      status: "unavailable",
      reason: "not_configured",
      message: messages.serverMessages.characterDetailNotConfigured,
    };
  }

  try {
    const row = await findCharacterDetailRowById(characterId);

    if (!row) {
      return { status: "not_found" };
    }

    return {
      status: "available",
      character: {
        ...row,
        classLabel: formatCharacterClassLabel(row.job, locale),
        guildRoleLabel: formatGuildRoleLabel(row, locale),
        skillGroupLabel: formatSkillGroupLabel(row.skillGroup, locale),
      },
    };
  } catch (error) {
    console.error("Failed to load character detail", error);

    return {
      status: "unavailable",
      reason: "query_failed",
      message: messages.serverMessages.characterDetailTemporarilyUnavailable,
    };
  }
}
