import type { BattlePokemon } from "@/domain/battle/types/BattleTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export type TeamMember = BattlePokemon & {
  readonly types: readonly PokemonType[];
};

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface TypeExposure {
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
}

export interface TeamRecommendation {
  readonly type: string;
  readonly severity: Severity;
  readonly title: string;
  readonly reason: string;
  readonly description: string;
  readonly attackingType: PokemonType;
  readonly affectedCount: number;
}

export interface TeamAnalysis {
  readonly defensiveCoverage: Readonly<Record<PokemonType, TypeExposure>>;
  readonly averageSpeed: number;
  readonly recommendations: readonly TeamRecommendation[];
  readonly teamSize: number;
}

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
  Info: 0,
};
