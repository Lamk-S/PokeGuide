import type { PokemonName, StatName } from "@/domain/pokemon/types/pokemon";
import type { CalculatedStats, Nature } from "@/domain/stats/types/StatTypes";

export interface BattlePokemon {
  name: PokemonName;
  level: number;
  nature: Nature;
  ability?: string;
  item?: string;
  evs: Record<StatName, number>;
  ivs: Record<StatName, number>;
  calculatedStats: CalculatedStats; // Calculado previamente por el Stat Engine
}

export interface BattleConditions {
  weather?: "Sun" | "Rain" | "Sand" | "Hail" | "Snow";
  terrain?: "Electric" | "Grassy" | "Psychic" | "Misty";
  isCriticalHit?: boolean;
}

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  damageRolls: number[];
}

export interface KOAnalysis {
  hitsToKO: number;
  guaranteed: boolean;
  probability: number;
}

export interface BattleExplanationFactor {
  label: string;
  description: string;
}

export interface BattleExplanation {
  summary: string;
  factors: BattleExplanationFactor[];
}

export interface BattleResult {
  damage: DamageResult;
  koAnalysis: KOAnalysis;
  explanation: BattleExplanation;
}
