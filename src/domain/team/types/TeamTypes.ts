import type { BattlePokemon } from "@/domain/battle/types/BattleTypes";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export type TeamMember = BattlePokemon & {
  types: PokemonType[];
};

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface TeamRecommendation {
  type: string;
  severity: Severity;
  title: string;
  description: string;
  reason: string;
}

export interface TypeExposure {
  weak: number;
  resist: number;
  immune: number;
  neutral: number;
}

export interface TeamAnalysis {
  defensiveCoverage: Record<PokemonType, TypeExposure>;
  averageSpeed: number;
  recommendations: TeamRecommendation[];
}
