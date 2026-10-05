import type { PokemonType, StatName } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "@/domain/stats/types/StatTypes";

export type EVSet = Record<StatName, number>;
export type IVSet = Record<StatName, number>;
export type BaseStats = Record<StatName, number>;

export interface CalculatedStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}

export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly displayNameEs: string;
  readonly species: string;
  readonly types: readonly PokemonType[];
  readonly abilityId: string | null;
  readonly itemId: string | null;
  readonly ability?: string | null;
  readonly item?: string | null;
  readonly nature: Nature | null;
  readonly level: number;
  readonly evs: EVSet;
  readonly ivs: IVSet;
  readonly calculatedStats: CalculatedStats;
  readonly baseStats: BaseStats;
}

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface TypeExposure {
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
}

export interface TeamRecommendation {
  readonly id: string;
  readonly type: "Defensive Gap" | "Dependency" | "Speed Control";
  readonly severity: Severity;
  readonly title: string;
  readonly reason: string;
  readonly description: string;
  readonly attackingType: PokemonType;
  readonly affectedCount: number;
  readonly evidence?: Readonly<Record<string, number>>;
}

export interface TeamAnalysis {
  readonly defensiveCoverage: Readonly<Record<PokemonType, TypeExposure>>;
  readonly averageSpeed: number;
  readonly maxSpeed: number;
  readonly effectiveMaxSpeed: number;
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

export const DEFAULT_EVS: EVSet = Object.freeze({
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
});

export const PERFECT_IVS: IVSet = Object.freeze({
  hp: 31,
  attack: 31,
  defense: 31,
  "special-attack": 31,
  "special-defense": 31,
  speed: 31,
});
