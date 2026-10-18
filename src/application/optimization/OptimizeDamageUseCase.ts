import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import {
  optimizeDamage,
  type DamageEvaluator,
} from "@/domain/optimization/services/DamageOptimizer";
import type {
  StatName,
  OffensiveStat,
} from "@/domain/optimization/types/OptimizationTypes";
import type { NatureContext } from "@/domain/optimization/entities/OptimizationProblem";

export type OptimizeDamageInput = {
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
  readonly targetPercent: number;
  readonly offensiveStat: OffensiveStat;
  readonly currentEVs?: Partial<Record<StatName, number>>;
  readonly evaluator: DamageEvaluator;
};

function toNatureContext(n: OptimizeDamageInput["nature"]): NatureContext {
  return {
    name: n.name,
    nameEs: n.nameEs ?? n.name,
    increasedStat: n.increasedStat,
    decreasedStat: n.decreasedStat,
  };
}

export function OptimizeDamageUseCase(input: OptimizeDamageInput) {
  const problem = new OptimizationProblem(
    { type: "ev_investment", direction: "minimize" },
    [
      {
        variable: input.offensiveStat,
        operator: "gte",
        target: input.targetPercent,
      },
    ],
    {
      baseStats: input.baseStats,
      ivs: input.ivs,
      level: input.level,
      nature: toNatureContext(input.nature),
      generation: input.generation,
      currentEVs: input.currentEVs ?? {},
    },
  );
  return optimizeDamage(problem, input.evaluator, input.offensiveStat);
}
