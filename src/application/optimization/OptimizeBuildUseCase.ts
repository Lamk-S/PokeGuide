import type { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import { SurvivalOptimizer } from "@/domain/optimization/services/SurvivalOptimizer";
import type { OptimizationResult } from "@/domain/optimization/types/OptimizationTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export class OptimizeBuildUseCase {
  execute(
    problem: OptimizationProblem,
    damageEvaluator?: (hpEV: number, defEV: number) => boolean,
  ): OptimizationResult<number | Record<StatName, number>> {
    const constraint = problem.constraints[0];

    if (constraint.variable === "speed") {
      return SpeedOptimizer.optimize(problem);
    }

    if (
      constraint.variable === "survival_physical" ||
      constraint.variable === "survival_special"
    ) {
      if (!damageEvaluator) {
        throw new Error(
          "Se requiere un evaluador de daño para optimizar supervivencia.",
        );
      }
      const defStat =
        constraint.variable === "survival_physical"
          ? "defense"
          : "special-defense";
      return SurvivalOptimizer.optimize(problem, damageEvaluator, defStat);
    }

    return {
      status: "Unsupported",
      solution: null,
      explanation: null,
      metrics: { candidatesEvaluated: 0, executionTimeMs: 0 },
    };
  }
}
