import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import {
  optimizeSurvival,
  type SurvivalEvaluator,
} from "@/domain/optimization/services/SurvivalOptimizer";
import type {
  StatName,
  DefenseStat,
} from "@/domain/optimization/types/OptimizationTypes";
import type { NatureContext } from "@/domain/optimization/entities/OptimizationProblem";

export type OptimizeSurvivalInput = {
  readonly baseStats: Record<StatName, number>;
  readonly ivs: Record<StatName, number>;
  readonly nature: {
    name: string;
    nameEs?: string;
    increasedStat: StatName | null;
    decreasedStat: StatName | null;
  };
  readonly level: number;
  readonly generation: number;
  readonly defenseStat: DefenseStat;
  readonly currentEVs?: Partial<Record<StatName, number>>;
  readonly evaluator: SurvivalEvaluator;
};

function toNatureContext(n: OptimizeSurvivalInput["nature"]): NatureContext {
  return {
    name: n.name,
    nameEs: n.nameEs ?? n.name,
    increasedStat: n.increasedStat,
    decreasedStat: n.decreasedStat,
  };
}

export function OptimizeSurvivalUseCase(input: OptimizeSurvivalInput) {
  const survivalVar =
    input.defenseStat === "defense" ? "survival_physical" : "survival_special";
  const problem = new OptimizationProblem(
    { type: "ev_investment", direction: "minimize" },
    [{ variable: survivalVar, operator: "gte", target: 1 }],
    {
      baseStats: input.baseStats,
      ivs: input.ivs,
      level: input.level,
      nature: toNatureContext(input.nature),
      generation: input.generation,
      currentEVs: input.currentEVs ?? {},
    },
  );
  return optimizeSurvival(problem, input.evaluator, input.defenseStat);
}
