import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type {
  TypeExposure,
  TeamRecommendation,
  Severity,
  RecommendationIssueCode,
  RecommendationCategory,
  TeamMember,
} from "../types/TeamTypes";
import type { BattleRuleset } from "../config/battleFormat";

const SEVERITY_ORDER: Record<Severity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Info: 4,
};

function createId(prefix: string, type: PokemonType): string {
  return `${prefix}-${type}`;
}

export function generate(
  coverage: Record<string, TypeExposure>,
  _members?: readonly TeamMember[] | unknown,
  _ruleset?: BattleRuleset | unknown,
): TeamRecommendation[] {
  const recommendations: TeamRecommendation[] = [];

  for (const [rawType, exposure] of Object.entries(coverage)) {
    if (!exposure) continue;
    const attackingType = rawType as PokemonType;
    const { weak, resist, immune } = exposure;
    const totalResist = resist + immune;

    if (weak >= 3 && totalResist <= 1) {
      recommendations.push({
        id: createId("massive-weakness", attackingType),
        severity: "Critical",
        issueCode: "massive_weakness" as RecommendationIssueCode,
        category: "defensive_gap" as RecommendationCategory,
        attackingType,
        targetType: attackingType,
        evidence: { ...exposure },
      });
      continue;
    }

    if (weak === 2 && totalResist <= 1) {
      recommendations.push({
        id: createId("single-point", attackingType),
        severity: "High",
        issueCode: "single_point_failure" as RecommendationIssueCode,
        category: "dependency" as RecommendationCategory,
        attackingType,
        targetType: attackingType,
        evidence: { ...exposure },
      });
      continue;
    }

    if (weak > 2 && totalResist === 0) {
      recommendations.push({
        id: createId("redundant", attackingType),
        severity: "High",
        issueCode: "redundant_weakness" as RecommendationIssueCode,
        category: "defensive_gap" as RecommendationCategory,
        attackingType,
        targetType: attackingType,
        evidence: { ...exposure },
      });
    }
  }

  return recommendations.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.targetType.localeCompare(b.targetType);
  });
}

export const RecommendationEngine = {
  generate,
};
