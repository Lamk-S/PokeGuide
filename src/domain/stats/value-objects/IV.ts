import { InvalidIVError } from "../errors/StatErrors";
import type { StatName } from "@/domain/pokemon/types/pokemon";

export type IVSet = Record<StatName, number>;

export class IV {
  private constructor(public readonly value: number) {}

  static create(value: number): IV {
    const parsed = Math.floor(value);
    if (parsed < 0 || parsed > 31) {
      throw new InvalidIVError(
        `El IV debe estar entre 0 y 31. Recibido: ${value}`,
      );
    }
    return new IV(parsed);
  }

  static createSet(ivs: IVSet): Record<StatName, IV> {
    return {
      hp: IV.create(ivs.hp),
      attack: IV.create(ivs.attack),
      defense: IV.create(ivs.defense),
      "special-attack": IV.create(ivs["special-attack"]),
      "special-defense": IV.create(ivs["special-defense"]),
      speed: IV.create(ivs.speed),
    };
  }
}
