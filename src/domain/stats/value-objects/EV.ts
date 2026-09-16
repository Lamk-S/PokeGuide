import type { StatName } from "../types/StatTypes";

export type EV = number;
export type EVSet = Record<StatName, number>;

/**
 * Value Object para gestionar la integridad y límites de los EVs.
 */
export const EV = {
  MIN: 0,
  MAX_STAT: 252,
  MAX_TOTAL: 510,

  /**
   * Calcula el total de EVs asignados en un set.
   */
  calculateTotal(evs: EVSet): number {
    return Object.values(evs).reduce((sum, val) => sum + val, 0);
  },

  /**
   * Valida y normaliza un EV asegurando que no exceda su límite individual
   * ni el límite global de la build.
   */
  create(value: number, statName: StatName, currentSet: EVSet): EV {
    let normalized = Math.floor(value);
    if (Number.isNaN(normalized) || normalized < this.MIN)
      normalized = this.MIN;
    if (normalized > this.MAX_STAT) normalized = this.MAX_STAT;

    // Calcular la suma de los otros stats para no superar el límite de 510
    const otherTotal =
      this.calculateTotal(currentSet) - (currentSet[statName] || 0);
    const maxAllowedByTotal = this.MAX_TOTAL - otherTotal;

    if (normalized > maxAllowedByTotal) {
      normalized = Math.max(this.MIN, maxAllowedByTotal);
    }

    return normalized;
  },

  /**
   * Genera un set de EVs completamente vacío.
   */
  createEmptySet(): EVSet {
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
  },

  /**
   * Set completo a partir de un objeto parcial,
   * respetando matemáticamente el límite de 510 en la creación.
   */
  createSet(raw: Partial<EVSet>): EVSet {
    const result = this.createEmptySet();
    const keys: StatName[] = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ];

    for (const key of keys) {
      result[key] = this.create(raw[key] ?? 0, key, result);
    }

    return result;
  },
} as const;
