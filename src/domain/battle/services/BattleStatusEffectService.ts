import type { MoveCategory } from "../value-objects/MoveCategory";
import { isPhysicalCategory } from "../value-objects/MoveCategory";
import { isGutsAbility } from "../value-objects/AbilityId";
import { isFacadeMove } from "../value-objects/MoveId";

export type StatusEffectResult = {
  applies: boolean;
  multiplier: number;
  log: string;
  explanation: string;
};

export interface BurnContext {
  moveId: string;
  moveName?: string | undefined;
  moveCategory: MoveCategory;
  abilityId?: string | undefined;
  abilityName?: string | undefined;
}

export function evaluateBurn(context: BurnContext): StatusEffectResult {
  const { moveId, moveCategory, abilityId } = context;

  if (!isPhysicalCategory(moveCategory)) {
    return {
      applies: false,
      multiplier: 1.0,
      log: "Quemadura no afecta (mov. especial/estado)",
      explanation: "La quemadura solo reduce daño físico.",
    };
  }

  if (isFacadeMove(moveId)) {
    return {
      applies: true,
      multiplier: 2.0,
      log: "Facade x2.0 (potenciado por quemadura)",
      explanation: "Facade duplica potencia cuando el atacante está quemado.",
    };
  }

  if (isGutsAbility(abilityId)) {
    return {
      applies: true,
      multiplier: 1.0,
      log: "Guts ignora quemadura + x1.5 ATQ",
      explanation:
        "Guts ignora la reducción de quemadura y potencia el ataque.",
    };
  }

  return {
    applies: true,
    multiplier: 0.5,
    log: "Quemadura Atacante x0.5 (solo físico)",
    explanation: "Quemadura reduce a la mitad el daño físico.",
  };
}

export function getCriticalMultiplier(generation: number): number {
  return generation >= 6 ? 1.5 : 2.0;
}

export function getCriticalLog(generation: number): string {
  const mult = getCriticalMultiplier(generation);
  return `Golpe Crítico x${mult.toFixed(1)}`;
}

export const BattleStatusEffectService = {
  evaluateBurn,
  getCriticalMultiplier,
  getCriticalLog,
};
