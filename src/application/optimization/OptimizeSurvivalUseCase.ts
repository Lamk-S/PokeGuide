import { OptimizationWorkerClient } from "@/infrastructure/workers/OptimizationWorkerClient";
import type {
  StatSetPayload,
  SurvivalOptimizationPayload,
  SurvivalOptimizationResult,
} from "@/infrastructure/workers/optimization.types";

export interface OptimizeSurvivalInput {
  baseStats: StatSetPayload;
  level: number;
  natureName: string;
  ivs: StatSetPayload;
  evsBudget: number;
  generation: number;
  survivalTarget: {
    incomingMovePower: number;
    incomingMoveType: string;
    attackerLevel: number;
    attackerBaseStats: StatSetPayload;
    attackerNatureName: string;
    requiredSurvivalPercent: number;
    weather?: string;
    terrain?: string;
  };
}

export type OptimizeSurvivalOutput = SurvivalOptimizationResult;

export class OptimizeSurvivalUseCase {
  private readonly workerClient: OptimizationWorkerClient;

  constructor(
    workerClient: OptimizationWorkerClient = OptimizationWorkerClient.getInstance(),
  ) {
    this.workerClient = workerClient;
  }

  async execute(input: OptimizeSurvivalInput): Promise<OptimizeSurvivalOutput> {
    if (!input) {
      throw new Error("INVALID_INPUT: Survival optimization input requerido");
    }

    if (input.level <= 0 || input.level > 100) {
      throw new Error(`INVALID_LEVEL: ${input.level}`);
    }

    if (
      input.survivalTarget.requiredSurvivalPercent <= 0 ||
      input.survivalTarget.requiredSurvivalPercent > 100
    ) {
      throw new Error(
        `INVALID_SURVIVAL_PERCENT: ${input.survivalTarget.requiredSurvivalPercent}`,
      );
    }

    if (input.survivalTarget.incomingMovePower <= 0) {
      throw new Error(
        `INVALID_MOVE_POWER: ${input.survivalTarget.incomingMovePower}`,
      );
    }

    const payload: SurvivalOptimizationPayload = {
      baseStats: input.baseStats,
      level: input.level,
      natureName: input.natureName,
      ivs: input.ivs,
      evsBudget: input.evsBudget,
      generation: input.generation,
      survivalTarget: {
        incomingMovePower: input.survivalTarget.incomingMovePower,
        incomingMoveType: input.survivalTarget.incomingMoveType,
        attackerLevel: input.survivalTarget.attackerLevel,
        attackerBaseStats: input.survivalTarget.attackerBaseStats,
        attackerNatureName: input.survivalTarget.attackerNatureName,
        requiredSurvivalPercent: input.survivalTarget.requiredSurvivalPercent,
        weather: input.survivalTarget.weather,
        terrain: input.survivalTarget.terrain,
      },
    };

    try {
      const result = await this.workerClient.optimizeSurvival(payload);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`OPTIMIZE_SURVIVAL_FAILED: ${message}`);
    }
  }
}

export const optimizeSurvivalUseCase = new OptimizeSurvivalUseCase();
