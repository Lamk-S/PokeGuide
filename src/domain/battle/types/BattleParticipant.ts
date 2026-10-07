import type { StatName } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  WeatherId,
  TerrainId,
  StatusId,
} from "@/domain/battle/value-objects/BattleModifiers";

export type { StatName, Nature, WeatherId, TerrainId, StatusId };
export type IBattleNature = Nature;
export type StatSet = Record<StatName, number>;

export interface IPokemonBaseData {
  id: number;
  name: string;
  baseStats: StatSet;
}

export interface IPokemonBaseProvider {
  getBaseDataById(id: number): Promise<IPokemonBaseData | null>;
}

export interface IBattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  evs: StatSet;
  ivs: StatSet;
  ability?: string | undefined;
  abilityId?: string | undefined;
  item?: string | undefined;
  status?: StatusId | undefined;
  isCriticalHit?: boolean | undefined;
}

export interface IResolvedParticipant
  extends Omit<IBattleParticipantInput, "pokemonId"> {
  id: number;
  name: string;
  baseStats: StatSet;
}

export interface IBattleConditions {
  weather: WeatherId;
  terrain: TerrainId;
}

export interface IResolvedBattleScenario {
  generation: number;
  attacker: IResolvedParticipant;
  defender: IResolvedParticipant;
  moveName: string;
  moveId: string;
  conditions: IBattleConditions;
}

export interface DamageResult {
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
}

export interface KOAnalysis {
  guaranteed: boolean;
  hitsToKO: number;
  probability: number;
}

export interface BattleExplanation {
  summary: string;
  activeModifiers: string[];
}

export interface BattleResult {
  damage: DamageResult;
  koAnalysis: KOAnalysis;
  explanation: BattleExplanation;
  defenderMaxHp: number;
  isOHKO: boolean;
  effectiveness: number;
  moveCategoryUsed: string;
}
