import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import type {
  SpeedOptimizationInput,
  SpeedOptimizationResult,
} from "@/domain/optimization/types/OptimizationTypes";

export class OptimizeSpeedUseCase {
  execute(input: SpeedOptimizationInput): SpeedOptimizationResult {
    const problem = new OptimizationProblem(
      { type: "ev_investment", direction: "minimize" },
      [{ variable: "speed", operator: "gte", target: input.targetSpeed }],
      {
        baseStats: input.baseStats,
        ivs: input.ivs,
        level: input.level,
        nature: input.nature,
        generation: input.generation,
        currentEVs: input.currentEVs,
      },
    );
    return SpeedOptimizer.optimize(problem);
  }
}
export const optimizeSpeedUseCase = new OptimizeSpeedUseCase();
