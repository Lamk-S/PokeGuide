import type { IVSet } from "../value-objects/IV";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export interface HiddenPowerResult {
  available: boolean;
  type?: PokemonType;
  power?: number;
  reason?: string;
}

const HIDDEN_POWER_TYPES = [
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
] as const satisfies readonly PokemonType[];

export function calculateHiddenPower(
  ivs: IVSet,
  generation: number,
): HiddenPowerResult {
  if (generation >= 8) {
    return { available: false, reason: "No disponible en Gen 8+" };
  }
  if (generation < 3) {
    return { available: false, reason: "No disponible en Gen 2-" };
  }

  // Tipo: bit 0 de cada IV
  const a =
    (ivs.hp % 2) +
    (ivs.attack % 2) * 2 +
    (ivs.defense % 2) * 4 +
    (ivs.speed % 2) * 8 +
    (ivs["special-attack"] % 2) * 16 +
    (ivs["special-defense"] % 2) * 32;

  const type = HIDDEN_POWER_TYPES[Math.floor((a * 15) / 63)];

  // Cálculo de la Potencia
  if (generation >= 6) {
    return { available: true, type, power: 60 };
  }

  // Potencia Gen 3-5: bit 1 de cada IV
  const b =
    (ivs.hp % 4 >= 2 ? 1 : 0) +
    (ivs.attack % 4 >= 2 ? 1 : 0) * 2 +
    (ivs.defense % 4 >= 2 ? 1 : 0) * 4 +
    (ivs.speed % 4 >= 2 ? 1 : 0) * 8 +
    (ivs["special-attack"] % 4 >= 2 ? 1 : 0) * 16 +
    (ivs["special-defense"] % 4 >= 2 ? 1 : 0) * 32;

  const power = Math.floor((b * 40) / 63) + 30;

  return { available: true, type, power };
}

export const HiddenPowerService = {
  calculate: calculateHiddenPower,
} as const;
