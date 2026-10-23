export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";
export const STAT_NAMES: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
export type IVSet = Record<StatName, number>;

export class IV {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(value: number): IV {
    const num = Number.isFinite(value) ? Math.floor(value) : 0;
    return new IV(Math.max(0, Math.min(31, num)));
  }

  static createSet(input: Partial<Record<StatName, number | IV>> = {}): IVSet {
    const result = {} as IVSet;
    for (const stat of STAT_NAMES) {
      const raw = input[stat];
      const num = raw instanceof IV ? raw.value : (raw as number | undefined);
      result[stat] = IV.create(num ?? 31).value;
    }
    return result;
  }

  static createPerfectSet(): IVSet {
    return {
      hp: 31,
      attack: 31,
      defense: 31,
      "special-attack": 31,
      "special-defense": 31,
      speed: 31,
    };
  }

  static createEmptySet(): IVSet {
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
  }

  toNumber(): number {
    return this.value;
  }
  equals(other: IV): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return `${this.value}`;
  }
}
