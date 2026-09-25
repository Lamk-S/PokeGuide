import type {
  PokemonId,
  PokemonName,
  StatName,
} from "@/domain/pokemon/types/pokemon";
import type { CalculatedStats, Nature } from "@/domain/stats/types/StatTypes";
import type {
  WeatherId,
  TerrainId,
  StatusId,
} from "../value-objects/BattleModifiers";

export type { WeatherId, TerrainId, StatusId };

export interface BattlePokemon {
  id: PokemonId;
  name: PokemonName;
  level: number;
  nature: Nature;
  ability?: string;
  item?: string;
  status?: StatusId;
  evs: Record<StatName, number>;
  ivs: Record<StatName, number>;
  calculatedStats: CalculatedStats;
}

export interface BattleConditions {
  weather?: WeatherId;
  terrain?: TerrainId;
  isCriticalHit?: boolean;
}

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
}
export interface KOAnalysis {
  hitsToKO: number;
  guaranteed: boolean;
  probability: number;
}
export interface BattleContextFactor {
  label: string;
  value: string;
}
export interface BattleExplanation {
  summary: string;
  activeModifiers: string[];
  context: BattleContextFactor[];
}
export interface BattleResult {
  defenderMaxHp: number;
  damage: DamageResult;
  koAnalysis: KOAnalysis;
  explanation: BattleExplanation;
}
