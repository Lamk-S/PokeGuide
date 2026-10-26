import { OptimizationWorkerClient } from "@/infrastructure/workers/OptimizationWorkerClient";
import type {
  SpeedOptimizationPayload,
  SpeedOptimizationResult,
} from "@/infrastructure/workers/optimization.types";

export type OptimizeSpeedInput = SpeedOptimizationPayload;
export type OptimizeSpeedOutput = SpeedOptimizationResult;

export class OptimizeSpeedUseCase {
  private readonly workerClient: OptimizationWorkerClient;

  constructor(
    workerClient: OptimizationWorkerClient = OptimizationWorkerClient.getInstance(),
  ) {
    this.workerClient = workerClient;
  }

  async execute(input: OptimizeSpeedInput): Promise<OptimizeSpeedOutput> {
    if (!input) {
      throw new Error("INVALID_INPUT: Speed optimization input requerido");
    }

    if (input.level <= 0 || input.level > 100) {
      throw new Error(`INVALID_LEVEL: ${input.level} debe estar entre 1 y 100`);
    }

    if (input.targetSpeed <= 0) {
      throw new Error(
        `INVALID_TARGET_SPEED: ${input.targetSpeed} debe ser > 0`,
      );
    }

    if (input.evsBudget < 0 || input.evsBudget > 510) {
      throw new Error(
        `INVALID_EVS_BUDGET: ${input.evsBudget} debe estar entre 0 y 510`,
      );
    }

    try {
      const result = await this.workerClient.optimizeSpeed(input);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`OPTIMIZE_SPEED_FAILED: ${message}`);
    }
  }

  async call(input: OptimizeSpeedInput): Promise<OptimizeSpeedOutput> {
    return this.execute(input);
  }
}

export const optimizeSpeedUseCase = new OptimizeSpeedUseCase();

export async function OptimizeSpeedUseCaseFn(
  input: OptimizeSpeedInput,
): Promise<OptimizeSpeedOutput> {
  return optimizeSpeedUseCase.execute(input);
}
