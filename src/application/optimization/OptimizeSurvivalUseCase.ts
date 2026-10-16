import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SurvivalOptimizer } from "@/domain/optimization/services/SurvivalOptimizer";
import type {
  SurvivalOptimizationInput,
  SurvivalOptimizationResult,
  DefenseStat,
} from "@/domain/optimization/types/OptimizationTypes";

export type SurvivalEvaluator = (hpEV: number, defEV: number) => boolean;

export class OptimizeSurvivalUseCase {
  execute(
    input: SurvivalOptimizationInput,
    evaluator: SurvivalEvaluator,
    defenseStat: DefenseStat = "defense",
  ): SurvivalOptimizationResult {
    const variable =
      defenseStat === "defense" ? "survival_physical" : "survival_special";
    const problem = new OptimizationProblem(
      { type: "ev_investment", direction: "minimize" },
      [{ variable, operator: "gte", target: 1 }],
      {
        baseStats: input.baseStats,
        ivs: input.ivs,
        level: input.level,
        nature: input.nature,
        generation: input.generation,
        currentEVs: input.currentEVs,
      },
    );
    const finalEvaluator = input.evaluator ?? evaluator;
    if (!finalEvaluator) {
      return {
        status: "Unsupported",
        solution: null,
        totalEVs: null,
        explanation: { summary: "Evaluator no proporcionado", evidence: [] },
        metrics: { candidatesEvaluated: 0, iterations: 0, prunedBranches: 0 },
      };
    }
    return SurvivalOptimizer.optimize(problem, finalEvaluator, defenseStat);
  }
}
export const optimizeSurvivalUseCase = new OptimizeSurvivalUseCase();
