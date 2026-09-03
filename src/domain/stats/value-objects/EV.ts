import { InvalidEVError } from "../errors/StatErrors";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export type EVSet = Record<StatName, number>;

export class EV {
  private constructor(public readonly value: number) {}

  static create(value: number): EV {
    const parsed = Math.floor(value);
    if (parsed < 0 || parsed > 252) {
      throw new InvalidEVError(
        `Un EV individual debe estar entre 0 y 252. Recibido: ${value}`,
      );
    }
    return new EV(parsed);
  }

  static createSet(evs: EVSet): Record<StatName, EV> {
    const total = Object.values(evs).reduce((sum, val) => sum + val, 0);
    if (total > 510) {
      throw new InvalidEVError(
        `La suma total de EVs no puede exceder 510. Recibido: ${total}`,
      );
    }

    return {
      hp: EV.create(evs.hp),
      attack: EV.create(evs.attack),
      defense: EV.create(evs.defense),
      "special-attack": EV.create(evs["special-attack"]),
      "special-defense": EV.create(evs["special-defense"]),
      speed: EV.create(evs.speed),
    };
  }
}
