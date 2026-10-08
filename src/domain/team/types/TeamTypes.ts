import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "@/domain/stats/types/StatTypes";

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export type RecommendationIssueCode =
  | "massive_weakness"
  | "single_point_failure"
  | "redundant_weakness"
  | "speed_control_gap";

export type RecommendationCategory = "defensive_gap" | "dependency" | "speed";

export interface TypeExposure {
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
}

export type TeamRecommendationEvidence = TypeExposure;

export interface TeamRecommendation {
  readonly id: string;
  readonly severity: Severity;
  readonly issueCode: RecommendationIssueCode;
  readonly category: RecommendationCategory;
  readonly attackingType: PokemonType;
  readonly targetType: PokemonType;
  readonly evidence: TeamRecommendationEvidence;
}

export type EVSet = {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly "special-attack": number;
  readonly "special-defense": number;
  readonly speed: number;
};

export type IVSet = EVSet;
export type BaseStats = EVSet;

export interface CalculatedStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
  readonly spAttack?: number;
  readonly spDefense?: number;
}

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly displayNameEs?: string;
  readonly species?: string;
  readonly types: readonly PokemonType[];
  readonly abilityId: string | null;
  readonly itemId: string | null;
  readonly ability: string | null;
  readonly item: string | null;
  readonly nature: Nature;
  readonly level: number;
  readonly evs: EVSet;
  readonly ivs: IVSet;
  readonly calculatedStats: CalculatedStats;
  readonly baseStats: BaseStats;
}

export type DefensiveCoverage = Record<string, TypeExposure> &
  Partial<Record<PokemonType, TypeExposure>>;

export interface TeamAnalysis {
  readonly defensiveCoverage: DefensiveCoverage;
  readonly recommendations: readonly TeamRecommendation[];
  readonly averageSpeed: number;
  readonly maxSpeed: number;
  readonly effectiveMaxSpeed: number;
  readonly teamSize: number;
}
