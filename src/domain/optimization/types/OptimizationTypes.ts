export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export type OptimizationStatus =
  | "Optimal"
  | "Infeasible"
  | "Unsupported"
  | "Calculating";

export interface OptimizationMetrics {
  readonly candidatesEvaluated: number;
  readonly iterations: number;
  readonly prunedBranches: number;
  readonly executionTimeMs?: number;
}

export interface OptimizationExplanation {
  readonly summary: string;
  readonly evidence: string[];
}

export interface OptimizationProof {
  readonly failingCandidate: { ev: number; stat: number } | null;
  readonly passingCandidate: { ev: number; stat: number } | null;
}

// ---- Speed ----
export interface SpeedOptimizationResult {
  readonly status: OptimizationStatus;
  readonly solution: number | null;
  readonly achievedStat: number | null;
  readonly target: number;
  readonly explanation: OptimizationExplanation | null;
  readonly metrics: OptimizationMetrics;
  readonly proof: OptimizationProof | null;
}

export interface SpeedOptimizationInput {
  readonly baseStats: Record<StatName, number>;
  readonly ivs: Record<StatName, number>;
  readonly level: number;
  readonly nature: {
    readonly name: string;
    readonly nameEs?: string;
    readonly increasedStat: StatName | null;
    readonly decreasedStat: StatName | null;
  };
  readonly generation: number;
  readonly targetSpeed: number;
  readonly currentEVs?: Partial<Record<StatName, number>>;
}

// ---- Survival ----
export type DefenseStat = "defense" | "special-defense";

export interface SurvivalSolution {
  readonly hp: number;
  readonly defense?: number;
  readonly specialDefense?: number;
  readonly totalEVs: number;
}

export interface SurvivalOptimizationResult {
  readonly status: OptimizationStatus;
  readonly solution: SurvivalSolution | null;
  readonly totalEVs: number | null;
  readonly explanation: OptimizationExplanation | null;
  readonly metrics: OptimizationMetrics;
}

export interface SurvivalOptimizationInput {
  readonly baseStats: Record<StatName, number>;
  readonly ivs: Record<StatName, number>;
  readonly level: number;
  readonly nature: {
    readonly name: string;
    readonly nameEs?: string;
    readonly increasedStat: StatName | null;
    readonly decreasedStat: StatName | null;
  };
  readonly generation: number;
  readonly defenseStat: DefenseStat;
  readonly currentEVs?: Partial<Record<StatName, number>>;
  readonly evaluator?: (hpEV: number, defEV: number) => boolean;
}

export const EV_STEPS: readonly number[] = Object.freeze(
  Array.from({ length: 64 }, (_, i) => i * 4),
);

export const MAX_EV_SINGLE = 252;
export const MAX_EV_TOTAL = 510;
