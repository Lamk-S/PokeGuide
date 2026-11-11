import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { PokemonTeam } from "../entities/PokemonTeam";
import type { LegalityIssue, LegalityReport } from "../types/TeamTypes";

export interface BattleFormatRules {
  readonly name: string;
  readonly speciesClause: boolean;
  readonly itemClause: boolean;
  readonly maxTeamSize: number;
  readonly allowDuplicateAbilities?: boolean;
  readonly allowDuplicateMoves?: boolean;
}

export const DEFAULT_FORMAT: BattleFormatRules = {
  name: "OU",
  speciesClause: true,
  itemClause: false,
  maxTeamSize: 6,
};

export const VGC_FORMAT: BattleFormatRules = {
  name: "VGC",
  speciesClause: true,
  itemClause: true,
  maxTeamSize: 6,
};

function validate(
  team: PokemonTeam,
  format: BattleFormatRules = DEFAULT_FORMAT,
): LegalityReport {
  const issues: LegalityIssue[] = [];
  const members = team.getMembers();

  if (members.length > format.maxTeamSize) {
    issues.push({
      code: "ev_overflow",
      message: `Equipo excede tamaño máximo ${format.maxTeamSize}: ${members.length}`,
      membersInvolved: members.map((m) => m.id),
      severity: "Critical",
    });
  }

  if (format.speciesClause) {
    const speciesMap = new Map<string, string[]>();
    for (const m of members) {
      const base = normalizeId(m.species ?? m.name.split("-")[0] ?? m.name);
      const key = base.toLowerCase();
      if (!speciesMap.has(key)) speciesMap.set(key, []);
      speciesMap.get(key)?.push(m.id);
    }
    for (const [species, ids] of speciesMap.entries()) {
      if (ids.length > 1) {
        issues.push({
          code: "species_clause",
          message: `Species Clause: ${species} repetida ${ids.length} veces`,
          membersInvolved: ids,
          severity: "Critical",
        });
      }
    }
  }

  if (format.itemClause) {
    const itemMap = new Map<string, string[]>();
    for (const m of members) {
      const itemId = normalizeId(m.itemId ?? m.item ?? "");
      if (!itemId) continue;
      if (!itemMap.has(itemId)) itemMap.set(itemId, []);
      itemMap.get(itemId)?.push(m.id);
    }
    for (const [item, ids] of itemMap.entries()) {
      if (ids.length > 1) {
        issues.push({
          code: "item_clause",
          message: `Item Clause: ${item} repetido ${ids.length} veces`,
          membersInvolved: ids,
          severity: "High",
        });
      }
    }
  }

  for (const m of members) {
    const total = Object.values(m.evs).reduce((a, b) => a + (b ?? 0), 0);
    if (total > 510) {
      issues.push({
        code: "ev_overflow",
        message: `${m.name} excede 510 EVs: ${total}`,
        membersInvolved: [m.id],
        severity: "High",
      });
    }
    for (const [stat, val] of Object.entries(m.evs)) {
      if ((val ?? 0) > 252) {
        issues.push({
          code: "ev_overflow",
          message: `${m.name} excede 252 EVs en ${stat}: ${val}`,
          membersInvolved: [m.id],
          severity: "High",
        });
      }
    }
    if (m.level < 1 || m.level > 100) {
      issues.push({
        code: "level_illegal",
        message: `${m.name} nivel ilegal: ${m.level}`,
        membersInvolved: [m.id],
        severity: "High",
      });
    }
  }

  const isLegal = issues.filter((i) => i.severity === "Critical").length === 0;

  return {
    isLegal,
    issues,
    format: format.name,
  };
}

export const TeamLegalityValidator = Object.freeze({
  validate,
  DEFAULT_FORMAT,
  VGC_FORMAT,
});
