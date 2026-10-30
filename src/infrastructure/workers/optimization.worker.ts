/// <reference lib="webworker" />

import { BattleAwareSurvivalOptimizer } from "@/domain/optimization/services/BattleAwareSurvivalOptimizer";
import { DamageOptimizer } from "@/domain/optimization/services/DamageOptimizer";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import { SurvivalOptimizer } from "@/domain/optimization/services/SurvivalOptimizer";
import {
  calculateStats,
  normalizeEVSet,
} from "@/domain/stats/services/StatCalculator";
import type {
  DamageOptimizationPayload,
  DamageOptimizationResult,
  OptimizationWorkerRequest,
  OptimizationWorkerResponse,
  SpeedOptimizationPayload,
  SpeedOptimizationResult,
  SurvivalOptimizationPayload,
  SurvivalOptimizationResult,
} from "./optimization.types";

declare const self: DedicatedWorkerGlobalScope;
const ctx = self as unknown as DedicatedWorkerGlobalScope;

function buildSurvivalEvaluator(payload: SurvivalOptimizationPayload) {
  return (hpEV: number, defEV: number): boolean => {
    try {
      const evs = normalizeEVSet({
        hp: hpEV,
        defense:
          payload.survivalTarget.incomingMoveType === "physical" ? defEV : 0,
        "special-defense":
          payload.survivalTarget.incomingMoveType !== "physical" ? defEV : 0,
      } as never);

      const stats = calculateStats({
        baseStats: payload.baseStats as never,
        level: payload.level,
        nature: { name: payload.natureName } as never,
        ivs: payload.ivs as never,
        evs: evs as never,
        generation: payload.generation,
      });

      const totalDef = (stats.defense ?? 0) + (stats["special-defense"] ?? 0);
      const required = payload.survivalTarget.requiredSurvivalPercent;
      const estimatedSurvival = Math.min(
        100,
        totalDef / 2 + (stats.hp ?? 0) / 4,
      );
      return estimatedSurvival >= required;
    } catch {
      return false;
    }
  };
}

function buildDamageEvaluator(payload: DamageOptimizationPayload) {
  return (offensiveEV: number, targetPercent: number): boolean => {
    try {
      const evs = normalizeEVSet({
        [payload.damageTarget.moveCategory === "Physical"
          ? "attack"
          : "special-attack"]: offensiveEV,
      } as never);

      const stats = calculateStats({
        baseStats: payload.baseStats as never,
        level: payload.level,
        nature: { name: payload.natureName } as never,
        ivs: payload.ivs as never,
        evs: evs as never,
        generation: payload.generation,
      });

      const atk =
        payload.damageTarget.moveCategory === "Physical"
          ? (stats.attack ?? 0)
          : (stats["special-attack"] ?? 0);
      const estimatedDamage = (atk / 200) * payload.damageTarget.movePower;
      return estimatedDamage >= targetPercent;
    } catch {
      return false;
    }
  };
}

function handleSpeedRequest(
  payload: SpeedOptimizationPayload,
): SpeedOptimizationResult {
  const input = {
    baseStats: payload.baseStats,
    level: payload.level,
    nature: { name: payload.natureName },
    ivs: payload.ivs,
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    },
    target: payload.targetSpeed,
    generation: payload.generation ?? 9,
  };

  const result = SpeedOptimizer.optimize(input as never);

  return {
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: (result.solution ?? 0) as number,
    },
    achievedSpeed: result.achievedStat ?? 0,
    targetSpeed: result.target,
    isSuccessful: result.status === "Optimal",
    iterations: result.metrics?.candidatesEvaluated ?? 0,
  };
}

function handleSurvivalRequest(
  payload: SurvivalOptimizationPayload,
): SurvivalOptimizationResult {
  const evaluator = buildSurvivalEvaluator(payload);

  const battleAwareResult = BattleAwareSurvivalOptimizer.optimize(
    payload.evsBudget,
    evaluator,
    "defense",
  );

  const input = {
    baseStats: payload.baseStats,
    level: payload.level,
    nature: { name: payload.natureName },
    ivs: payload.ivs,
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    },
    generation: payload.generation,
    defenseStat: "defense" as const,
  };

  const classicResult = SurvivalOptimizer.optimize(
    input as never,
    ((hp: number, def: number) => evaluator(hp, def)) as never,
    "defense" as never,
  );

  const solution = battleAwareResult.solution ?? classicResult.solution;
  const evs = {
    hp: (solution as { hp?: number })?.hp ?? 0,
    attack: 0,
    defense:
      (solution as { defense?: number })?.defense ??
      (solution as { specialDefense?: number })?.specialDefense ??
      0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };

  return {
    evs,
    achievedSurvivalPercent: payload.survivalTarget.requiredSurvivalPercent,
    requiredPercent: payload.survivalTarget.requiredSurvivalPercent,
    isSuccessful:
      battleAwareResult.status === "Optimal" ||
      classicResult.status === "Optimal",
    iterations:
      (battleAwareResult.metrics?.candidatesEvaluated ?? 0) +
      (classicResult.metrics?.candidatesEvaluated ?? 0),
  };
}

function handleDamageRequest(
  payload: DamageOptimizationPayload,
): DamageOptimizationResult {
  const evaluator = buildDamageEvaluator(payload);

  const input = {
    baseStats: payload.baseStats,
    level: payload.level,
    nature: { name: payload.natureName },
    ivs: payload.ivs,
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    },
    generation: payload.generation,
    offensiveStat: (payload.damageTarget.moveCategory === "Physical"
      ? "attack"
      : "special-attack") as never,
    targetPercent: payload.damageTarget.requiredDamagePercent,
  };

  const result = DamageOptimizer.optimize(
    input as never,
    evaluator as never,
    (payload.damageTarget.moveCategory === "Physical"
      ? "attack"
      : "special-attack") as never,
  );

  const evs = {
    hp: 0,
    attack:
      result.solution && payload.damageTarget.moveCategory === "Physical"
        ? (result.solution as number)
        : 0,
    defense: 0,
    "special-attack":
      result.solution && payload.damageTarget.moveCategory === "Special"
        ? (result.solution as number)
        : 0,
    "special-defense": 0,
    speed: 0,
  };

  return {
    evs,
    achievedDamagePercent: result.achievedPercent ?? 0,
    requiredPercent: result.target,
    isSuccessful: result.status === "Optimal",
    iterations: result.metrics?.candidatesEvaluated ?? 0,
  };
}

ctx.addEventListener(
  "message",
  (event: MessageEvent<OptimizationWorkerRequest>) => {
    const request = event.data as unknown as OptimizationWorkerRequest;

    const rawRequest = request as unknown as { id?: unknown; type?: unknown };
    if (
      !request ||
      typeof rawRequest.id !== "string" ||
      typeof rawRequest.type !== "string"
    ) {
      const errorResponse = {
        id: typeof rawRequest.id === "string" ? rawRequest.id : "unknown",
        type: "SPEED" as const,
        status: "ERROR" as const,
        error: "INVALID_REQUEST: missing id or type",
      } as unknown as OptimizationWorkerResponse;
      ctx.postMessage(errorResponse);
      return;
    }

    try {
      let data: unknown;
      switch (request.type) {
        case "SPEED":
          data = handleSpeedRequest(request.payload);
          break;
        case "SURVIVAL":
          data = handleSurvivalRequest(request.payload);
          break;
        case "DAMAGE":
          data = handleDamageRequest(request.payload);
          break;
        default: {
          const exhaustiveCheck: never = request;
          throw new Error(
            `UNSUPPORTED_TYPE: ${(exhaustiveCheck as { type: string }).type}`,
          );
        }
      }

      const successResponse = {
        id: request.id,
        type: request.type,
        status: "SUCCESS" as const,
        data: data as never,
      } as unknown as OptimizationWorkerResponse;

      ctx.postMessage(successResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        id: request.id,
        type: request.type,
        status: "ERROR" as const,
        error: `WORKER_ERROR [${request.type}]: ${message}`,
      } as unknown as OptimizationWorkerResponse;
      ctx.postMessage(errorResponse);
    }
  },
);

ctx.addEventListener("error", (event) => {
  const errorResponse = {
    id: "global",
    type: "SPEED" as const,
    status: "ERROR" as const,
    error: `WORKER_GLOBAL_ERROR: ${event.message}`,
  } as unknown as OptimizationWorkerResponse;
  ctx.postMessage(errorResponse);
});

export type { OptimizationWorkerRequest, OptimizationWorkerResponse };
