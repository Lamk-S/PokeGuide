import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { optimizeSpeed } from "@/domain/optimization/services/SpeedOptimizer";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import type { NatureContext } from "@/domain/optimization/entities/OptimizationProblem";

export type OptimizeSpeedInput = {
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
  readonly targetSpeed: number;
  readonly currentEVs?: Partial<Record<StatName, number>>;
};

function toNatureContext(n: OptimizeSpeedInput["nature"]): NatureContext {
  return {
    name: n.name,
    nameEs: n.nameEs ?? n.name,
    increasedStat: n.increasedStat,
    decreasedStat: n.decreasedStat,
  };
}

export function OptimizeSpeedUseCase(input: OptimizeSpeedInput) {
  const problem = new OptimizationProblem(
    { type: "ev_investment", direction: "minimize" },
    [{ variable: "speed", operator: "gte", target: input.targetSpeed }],
    {
      baseStats: input.baseStats,
      ivs: input.ivs,
      level: input.level,
      nature: toNatureContext(input.nature),
      generation: input.generation,
      currentEVs: input.currentEVs ?? {},
    },
  );
  return optimizeSpeed(problem);
}
