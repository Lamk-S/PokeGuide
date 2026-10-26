import { OptimizationWorkerClient } from "@/infrastructure/workers/OptimizationWorkerClient";
import type {
  DamageOptimizationPayload,
  DamageOptimizationResult,
  StatSetPayload,
} from "@/infrastructure/workers/optimization.types";

export interface OptimizeDamageInput {
  baseStats: StatSetPayload;
  level: number;
  natureName: string;
  ivs: StatSetPayload;
  evsBudget: number;
  generation: number;
  damageTarget: {
    defenderBaseStats: StatSetPayload;
    defenderLevel: number;
    defenderNatureName: string;
    movePower: number;
    moveType: string;
    moveCategory: "Physical" | "Special";
    requiredDamagePercent: number;
    weather?: string;
    terrain?: string;
  };
}

export type OptimizeDamageOutput = DamageOptimizationResult;

export class OptimizeDamageUseCase {
  private readonly workerClient: OptimizationWorkerClient;

  constructor(
    workerClient: OptimizationWorkerClient = OptimizationWorkerClient.getInstance(),
  ) {
    this.workerClient = workerClient;
  }

  async execute(input: OptimizeDamageInput): Promise<OptimizeDamageOutput> {
    if (!input) {
      throw new Error("INVALID_INPUT: Damage optimization input requerido");
    }

    if (input.level <= 0 || input.level > 100) {
      throw new Error(`INVALID_LEVEL: ${input.level}`);
    }

    if (
      input.damageTarget.requiredDamagePercent <= 0 ||
      input.damageTarget.requiredDamagePercent > 100
    ) {
      throw new Error(
        `INVALID_DAMAGE_PERCENT: ${input.damageTarget.requiredDamagePercent}`,
      );
    }

    if (input.damageTarget.movePower <= 0) {
      throw new Error(`INVALID_MOVE_POWER: ${input.damageTarget.movePower}`);
    }

    if (
      input.damageTarget.moveCategory !== "Physical" &&
      input.damageTarget.moveCategory !== "Special"
    ) {
      throw new Error(
        `INVALID_MOVE_CATEGORY: ${input.damageTarget.moveCategory}`,
      );
    }

    const payload: DamageOptimizationPayload = {
      baseStats: input.baseStats,
      level: input.level,
      natureName: input.natureName,
      ivs: input.ivs,
      evsBudget: input.evsBudget,
      generation: input.generation,
      damageTarget: {
        defenderBaseStats: input.damageTarget.defenderBaseStats,
        defenderLevel: input.damageTarget.defenderLevel,
        defenderNatureName: input.damageTarget.defenderNatureName,
        movePower: input.damageTarget.movePower,
        moveType: input.damageTarget.moveType,
        moveCategory: input.damageTarget.moveCategory,
        requiredDamagePercent: input.damageTarget.requiredDamagePercent,
        weather: input.damageTarget.weather,
        terrain: input.damageTarget.terrain,
      },
    };

    try {
      const result = await this.workerClient.optimizeDamage(payload);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`OPTIMIZE_DAMAGE_FAILED: ${message}`);
    }
  }
}

export const optimizeDamageUseCase = new OptimizeDamageUseCase();
