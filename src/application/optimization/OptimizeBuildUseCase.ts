import type { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import { SurvivalOptimizer } from "@/domain/optimization/services/SurvivalOptimizer";
import type { OptimizationResult } from "@/domain/optimization/types/OptimizationTypes";

type AnySolution =
  | number
  | { hp: number; defense: number; "special-defense"?: number }
  | null;

export class OptimizeBuildUseCase {
  execute(problem: OptimizationProblem): OptimizationResult<AnySolution> {
    const constraint = problem.constraints[0];
    if (!constraint) {
      return {
        status: "Invalid",
        solution: null,
        explanation: { summary: "Sin restricciones", evidence: [] },
        metrics: { candidatesEvaluated: 0 },
      };
    }

    if (constraint.variable === "speed") {
      return SpeedOptimizer.optimize(problem);
    }

    if (
      constraint.variable === "survival_physical" ||
      constraint.variable === "survival_special"
    ) {
      const evaluator = () => true;
      const targetStat =
        constraint.variable === "survival_physical"
          ? ("defense" as const)
          : ("special-defense" as const);
      return SurvivalOptimizer.optimize(problem, evaluator, targetStat);
    }

    return SpeedOptimizer.optimize(problem);
  }
}
