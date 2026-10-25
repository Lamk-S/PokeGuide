import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type BurnReasonCode =
  | "NOT_PHYSICAL"
  | "GUTS_IGNORES_BURN"
  | "FACADE_IGNORES_BURN_DROP"
  | "BURN_HALVES_PHYSICAL";

export interface BurnEvaluationInput {
  moveId: string;
  moveCategory: string;
  abilityId?: string | null;
}

export interface BurnEvaluationResult {
  applies: boolean;
  multiplier: number;
  reason: BurnReasonCode;
  log: string;
}

function buildLog(reason: BurnReasonCode, multiplier: number): string {
  return `[${reason}] multiplier:${multiplier.toFixed(1)}`;
}

export function evaluateBurn(input: BurnEvaluationInput): BurnEvaluationResult {
  const normalizedMoveId = normalizeId(input.moveId);
  const normalizedAbilityId = input.abilityId
    ? normalizeId(input.abilityId)
    : "";
  const isPhysical = input.moveCategory === "Physical";

  if (!isPhysical) {
    const reason: BurnReasonCode = "NOT_PHYSICAL";
    return {
      applies: false,
      multiplier: 1.0,
      reason,
      log: buildLog(reason, 1.0),
    };
  }

  if (normalizedAbilityId === "guts") {
    const reason: BurnReasonCode = "GUTS_IGNORES_BURN";
    return {
      applies: true,
      multiplier: 1.0,
      reason,
      log: buildLog(reason, 1.0),
    };
  }

  if (normalizedMoveId === "facade") {
    const reason: BurnReasonCode = "FACADE_IGNORES_BURN_DROP";
    return {
      applies: true,
      multiplier: 1.0,
      reason,
      log: buildLog(reason, 1.0),
    };
  }

  const reason: BurnReasonCode = "BURN_HALVES_PHYSICAL";
  return { applies: true, multiplier: 0.5, reason, log: buildLog(reason, 0.5) };
}

export function getCriticalMultiplier(generation: number): number {
  return generation < 6 ? 2.0 : 1.5;
}

export function getCriticalModifierCode(generation: number): string {
  const mult = getCriticalMultiplier(generation);
  return `CRITICAL_x${mult.toFixed(1)}`;
}

export function getCriticalLog(_generation: number): string {
  return "CRITICAL_HIT";
}

export const BattleStatusEffectService = {
  evaluateBurn,
  getCriticalMultiplier,
  getCriticalLog,
  getCriticalModifierCode,
};
