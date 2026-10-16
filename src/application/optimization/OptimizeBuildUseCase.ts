import { OptimizeSpeedUseCase } from "./OptimizeSpeedUseCase";
import {
  OptimizeSurvivalUseCase,
  type SurvivalEvaluator,
} from "./OptimizeSurvivalUseCase";
import type {
  SpeedOptimizationInput,
  SurvivalOptimizationInput,
  DefenseStat,
} from "@/domain/optimization/types/OptimizationTypes";

export class OptimizeBuildUseCase {
  private readonly speedUC = new OptimizeSpeedUseCase();
  private readonly survivalUC = new OptimizeSurvivalUseCase();

  optimizeSpeed(input: SpeedOptimizationInput) {
    return this.speedUC.execute(input);
  }

  optimizeSurvival(
    input: SurvivalOptimizationInput,
    evaluator: SurvivalEvaluator,
    defenseStat: DefenseStat = "defense",
  ) {
    return this.survivalUC.execute(input, evaluator, defenseStat);
  }
}
export const optimizeBuildUseCase = new OptimizeBuildUseCase();
