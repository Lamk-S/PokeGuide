import type { Nature } from "@/domain/stats/types/StatTypes";
import type { StatSet } from "@/domain/battle/types/BattleParticipant";

export interface OptimizationConstraint {
  variable: "speed" | "survival_physical" | "survival_special" | string;
  operator: "gte" | "lte" | "eq";
  target: number;
}

export interface OptimizationContext {
  baseStats: StatSet;
  ivs: StatSet;
  level: number;
  nature: Nature;
  generation: number;
}

export class OptimizationProblem {
  public readonly objective: {
    type: string;
    direction: "minimize" | "maximize";
  };
  public readonly constraints: OptimizationConstraint[];
  public readonly context: OptimizationContext;

  constructor(
    objective: { type: string; direction: "minimize" | "maximize" },
    constraints: OptimizationConstraint[],
    context: OptimizationContext,
  ) {
    this.objective = objective;
    this.constraints = constraints;
    this.context = context;
  }
}
