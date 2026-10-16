import type { StatName } from "../types/OptimizationTypes";
export type OptimizationObjective = {
  readonly type: "ev_investment";
  readonly direction: "minimize" | "maximize";
};
export type OptimizationConstraint = {
  readonly variable: string;
  readonly operator: "gte" | "lte" | "eq";
  readonly target: number;
};
export type OptimizationContext = {
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
  readonly currentEVs?: Partial<Record<StatName, number>>;
};
export class OptimizationProblem {
  constructor(
    public readonly objective: OptimizationObjective,
    public readonly constraints: OptimizationConstraint[],
    public readonly context: OptimizationContext,
  ) {}
  getSpeedTarget(): number | null {
    return this.constraints.find((x) => x.variable === "speed")?.target ?? null;
  }
}
