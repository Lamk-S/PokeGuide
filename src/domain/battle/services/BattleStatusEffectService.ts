/**
 * Servicio de Dominio - Efectos de Estado y Modificadores
 * Responsabilidad única: centralizar la lógica competitiva real de Pokémon
 * para evitar lógica fantasma y duplicación en UI / Adaptador.
 */

export type StatusEffectResult = {
  applies: boolean;
  multiplier: number;
  log: string;
  explanation: string;
};

export interface BurnContext {
  moveName: string;
  moveCategory?: "Physical" | "Special" | "Status" | undefined;
  ability?: string | undefined;
  isPhysical: boolean;
}

/**
 * Lógica oficial Pokémon para quemadura:
 * - Gen 3+: Quemadura reduce daño físico ×0.5
 * - NO afecta movimientos especiales
 * - Guts: ignora reducción y además da ×1.5 ATQ
 * - Facade: duplica potencia (70→140) cuando está quemado/paralizado/envenenado
 */
export function evaluateBurn(context: BurnContext): StatusEffectResult {
  const moveNameLower = context.moveName.toLowerCase();
  const abilityLower = context.ability?.toLowerCase() || "";
  const isFacade = moveNameLower === "facade";
  const hasGuts = abilityLower === "guts";

  // Si no es físico, quemadura no aplica
  if (!context.isPhysical) {
    return {
      applies: false,
      multiplier: 1.0,
      log: "Quemadura no afecta (mov. especial)",
      explanation: "La quemadura solo reduce daño físico.",
    };
  }

  if (isFacade) {
    return {
      applies: true,
      multiplier: 2.0,
      log: "Facade x2.0 (potenciado por quemadura)",
      explanation: "Facade duplica potencia cuando el atacante está quemado.",
    };
  }

  if (hasGuts) {
    return {
      applies: true,
      multiplier: 1.0, // El motor Smogon ya calcula el ×1.5 de Guts internamente
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

/**
 * Crítico por generación - mecánica oficial:
 * Gen 1-5: ×2.0
 * Gen 6+: ×1.5
 */
export function getCriticalMultiplier(generation: number): number {
  return generation >= 6 ? 1.5 : 2.0;
}

export function getCriticalLog(generation: number): string {
  const mult = getCriticalMultiplier(generation);
  return `Golpe Crítico x${mult.toFixed(1)}`;
}

// Compatibilidad hacia atrás para código existente que usa BattleStatusEffectService.xxx
export const BattleStatusEffectService = {
  evaluateBurn,
  getCriticalMultiplier,
  getCriticalLog,
};
