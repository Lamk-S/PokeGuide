import type { StatName } from "@/domain/pokemon/types/pokemon";

export interface Nature {
  name: string;
  increasedStat: StatName | null; // null significa naturaleza neutra
  decreasedStat: StatName | null;
}

export type BaseStats = Record<StatName, number>;
export type CalculatedStats = Record<StatName, number>;

export interface StatCalculationInput {
  baseStats: BaseStats;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
  level: number;
  nature: Nature;
  generation: number;
}
