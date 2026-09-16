import type { StatName } from "../types/StatTypes";

export type IV = number;
export type IVSet = Record<StatName, number>;

/**
 * Value Object para gestionar la integridad de los IVs.
 */
export const IV = {
  MIN: 0,
  MAX: 31,

  /**
   * Valida y normaliza un IV numérico individual.
   */
  create(value: number): IV {
    let normalized = Math.floor(value);
    if (Number.isNaN(normalized) || normalized < this.MIN)
      normalized = this.MIN;
    if (normalized > this.MAX) normalized = this.MAX;
    return normalized;
  },

  /**
   * Genera el set estándar competitivo perfecto.
   */
  createPerfectSet(): IVSet {
    return {
      hp: 31,
      attack: 31,
      defense: 31,
      "special-attack": 31,
      "special-defense": 31,
      speed: 31,
    };
  },

  /**
   * Set completo a partir de un objeto parcial,
   * aplicando defaults perfectos y validando.
   */
  createSet(raw: Partial<IVSet>): IVSet {
    const perfect = this.createPerfectSet();
    return {
      hp: this.create(raw.hp ?? perfect.hp),
      attack: this.create(raw.attack ?? perfect.attack),
      defense: this.create(raw.defense ?? perfect.defense),
      "special-attack": this.create(
        raw["special-attack"] ?? perfect["special-attack"],
      ),
      "special-defense": this.create(
        raw["special-defense"] ?? perfect["special-defense"],
      ),
      speed: this.create(raw.speed ?? perfect.speed),
    };
  },
} as const;
