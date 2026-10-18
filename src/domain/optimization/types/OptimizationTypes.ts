export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";
export type DefenseStat = "defense" | "special-defense";
export type OffensiveStat = "attack" | "special-attack";
export const EV_STEPS = Array.from(
  { length: 64 },
  (_, i) => i * 4,
) as readonly number[];
export type OptimizationStatus =
  | "Idle"
  | "Calculating"
  | "Optimal"
  | "Infeasible"
  | "Unsupported";
export type OptimizationMetrics = {
  readonly candidatesEvaluated: number;
  readonly iterations: number;
  readonly prunedBranches: number;
  readonly executionTimeMs?: number;
};
export type ProofCandidate = {
  readonly ev: number;
  readonly stat?: number;
  readonly dmg?: number;
  readonly percent?: number;
  readonly hpEv?: number;
  readonly defenseEv?: number;
};
export type Proof = {
  readonly failingCandidate: ProofCandidate | null;
  readonly passingCandidate: ProofCandidate | null;
} | null;
export type Explanation = {
  readonly summary: string;
  readonly evidence: readonly string[];
};
export type SpeedOptimizationResult = {
  readonly status: OptimizationStatus;
  readonly solution: number | null;
  readonly achievedStat: number | null;
  readonly target: number;
  readonly explanation: Explanation;
  readonly metrics: OptimizationMetrics;
  readonly proof: Proof;
};
export type DamageOptimizationResult = {
  readonly status: OptimizationStatus;
  readonly solution: number | null;
  readonly achievedPercent: number | null;
  readonly target: number;
  readonly explanation: Explanation;
  readonly metrics: OptimizationMetrics;
  readonly proof: Proof;
  readonly offensiveStat: OffensiveStat;
};
export type SurvivalSolution = {
  readonly hp: number;
  readonly defense?: number;
  readonly specialDefense?: number;
  readonly totalEVs: number;
};
export type SurvivalOptimizationResult = {
  readonly status: OptimizationStatus;
  readonly solution: SurvivalSolution | null;
  readonly totalEVs: number | null;
  readonly explanation: Explanation;
  readonly metrics: OptimizationMetrics;
  readonly defenseStat: DefenseStat;
};
export type BuildComparison = {
  readonly ahorro: number;
  readonly libres: number;
  readonly diffs: Array<{
    stat: StatName;
    original: number;
    optimizado: number;
  }>;
  readonly originalTotal: number;
  readonly optimizedTotal: number;
};
