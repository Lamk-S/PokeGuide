import type {
  RecommendationCategory,
  RecommendationIssueCode,
  Severity,
  TeamRecommendation,
  TypeExposure,
} from "@/domain/team/types/TeamTypes";

export type RecommendationSeverity = Severity;
export type { RecommendationCategory, RecommendationIssueCode };

export interface PureTeamRecommendation extends TeamRecommendation {
  weak: number;
  resist: number;
  immune: number;
  neutral: number;
}

type CoverageMap = Record<string, TypeExposure>;

function buildId(
  attackingType: string,
  issueCode: string,
  weak: number,
  resist: number,
): string {
  return `${attackingType}-${issueCode}-${weak}-${resist}`;
}

function createRecommendation(
  attackingType: string,
  exposure: TypeExposure,
  severity: Severity,
  issueCode: RecommendationIssueCode,
  category: RecommendationCategory,
): PureTeamRecommendation {
  const id = buildId(attackingType, issueCode, exposure.weak, exposure.resist);
  const evidence = {
    weak: exposure.weak,
    resist: exposure.resist,
    immune: exposure.immune,
    neutral: exposure.neutral,
  };

  return {
    id,
    severity,
    issueCode,
    category,
    attackingType,
    targetType: attackingType,
    evidence,
    weak: exposure.weak,
    resist: exposure.resist,
    immune: exposure.immune,
    neutral: exposure.neutral,
  } as PureTeamRecommendation;
}

function generate(coverage: CoverageMap): PureTeamRecommendation[] {
  const recommendations: PureTeamRecommendation[] = [];

  for (const [attackingType, exposure] of Object.entries(coverage)) {
    const totalResist = exposure.resist + exposure.immune;

    if (exposure.weak >= 3 && totalResist <= 1) {
      recommendations.push(
        createRecommendation(
          attackingType,
          exposure,
          "Critical" as Severity,
          "massive_weakness" as RecommendationIssueCode,
          "defensive_gap" as RecommendationCategory,
        ),
      );
      continue;
    }

    if (exposure.weak === 2 && exposure.resist === 1 && exposure.immune === 0) {
      recommendations.push(
        createRecommendation(
          attackingType,
          exposure,
          "High" as Severity,
          "single_point_failure" as RecommendationIssueCode,
          "dependency" as RecommendationCategory,
        ),
      );
      continue;
    }

    if (exposure.weak >= 2 && totalResist === 0) {
      recommendations.push(
        createRecommendation(
          attackingType,
          exposure,
          "High" as Severity,
          "massive_weakness" as RecommendationIssueCode,
          "defensive_gap" as RecommendationCategory,
        ),
      );
    }
  }

  return recommendations;
}

export const RecommendationEngine = {
  generate,
};
