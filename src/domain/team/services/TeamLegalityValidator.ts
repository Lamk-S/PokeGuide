import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { BattleRuleset } from "@/domain/team/config/battleFormat";
import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import type {
  LegalityIssue,
  LegalityReport,
  TeamMember,
} from "@/domain/team/types/TeamTypes";

type MemberId = string;

function findSpeciesDuplicates(
  members: readonly TeamMember[],
): Map<string, MemberId[]> {
  const map = new Map<string, MemberId[]>();
  for (const m of members) {
    const key = normalizeId(m.species ?? m.name ?? String(m.pokemonId));
    const list = map.get(key) ?? [];
    list.push(m.id);
    map.set(key, list);
  }
  return new Map([...map.entries()].filter(([, ids]) => ids.length > 1));
}

function findItemDuplicates(
  members: readonly TeamMember[],
): Map<string, MemberId[]> {
  const map = new Map<string, MemberId[]>();
  for (const m of members) {
    const raw = m.itemId ?? m.item;
    if (!raw) continue;
    const key = normalizeId(raw);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(m.id);
    map.set(key, list);
  }
  return new Map([...map.entries()].filter(([, ids]) => ids.length > 1));
}

function buildIssuesFromDuplicates(
  duplicates: Map<string, MemberId[]>,
  code: LegalityIssue["code"],
  severity: LegalityIssue["severity"],
  messageFactory: (key: string, ids: MemberId[]) => string,
): LegalityIssue[] {
  const issues: LegalityIssue[] = [];
  for (const [key, ids] of duplicates.entries()) {
    issues.push(
      Object.freeze({
        code,
        severity,
        message: messageFactory(key, ids),
        membersInvolved: Object.freeze([...ids]),
        details: Object.freeze({ duplicateKey: key, count: ids.length }),
      }),
    );
  }
  return issues;
}

export function validateTeamLegality(
  team: PokemonTeam,
  ruleset: BattleRuleset,
): LegalityReport {
  const members = team.getMembers();
  const issuesMutable: LegalityIssue[] = [];

  const formatId: string = ruleset.id ?? "singles-6v6";
  const formatLower = formatId.toLowerCase();

  const speciesDupes = findSpeciesDuplicates(members);
  issuesMutable.push(
    ...buildIssuesFromDuplicates(
      speciesDupes,
      "species_clause",
      "Critical",
      (key, ids) =>
        `Species Clause: especie duplicada "${key}" en miembros [${ids.join(", ")}]`,
    ),
  );

  const requiresItemClause =
    formatLower.includes("vgc") || formatLower.includes("doubles");

  if (requiresItemClause) {
    const itemDupes = findItemDuplicates(members);
    issuesMutable.push(
      ...buildIssuesFromDuplicates(
        itemDupes,
        "item_clause",
        "Critical",
        (key, ids) =>
          `Item Clause (VGC): objeto duplicado "${key}" en miembros [${ids.join(", ")}]`,
      ),
    );
  }

  const hasCritical = issuesMutable.some((i) => i.severity === "Critical");

  return Object.freeze({
    isLegal: !hasCritical,
    issues: Object.freeze([...issuesMutable]),
    format: formatId,
  });
}

export const TeamLegalityValidator = Object.freeze({
  validate: validateTeamLegality,
});
