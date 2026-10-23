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
export const MAX_EV_PER_STAT = 252;
export const MAX_EV_TOTAL = 510;
export type EVSet = Record<StatName, number>;

function clampSingle(value: number): number {
  const num = Number.isFinite(value) ? Math.floor(value) : 0;
  const clamped = Math.max(0, Math.min(MAX_EV_PER_STAT, num));
  return Math.floor(clamped / 4) * 4;
}

function sumEVs(evs: Record<StatName, number>): number {
  return STAT_NAMES.reduce((a, s) => a + (evs[s] ?? 0), 0);
}

export function normalizeEVSet(
  input: Partial<Record<StatName, number>>,
): EVSet {
  const clamped = {} as EVSet;
  for (const s of STAT_NAMES) clamped[s] = clampSingle(input[s] ?? 0);
  const total = sumEVs(clamped);
  if (total <= MAX_EV_TOTAL) return clamped;
  let excess = total - MAX_EV_TOTAL;
  const sorted = [...STAT_NAMES].sort((a, b) => clamped[b] - clamped[a]);
  for (const s of sorted) {
    if (excess <= 0) break;
    const red = Math.min(clamped[s], excess);
    clamped[s] -= red;
    excess -= red;
  }
  return clamped;
}

export class EV {
  private constructor(public readonly value: number) {
    Object.freeze(this);
  }

  static create(
    value: number,
    stat?: StatName | unknown,
    _set?: unknown,
  ): EV | number {
    const clamped = clampSingle(value);
    if (stat !== undefined) {
      return clamped;
    }
    return new EV(clamped);
  }

  static createSet(input: Partial<Record<StatName, number>> = {}): EVSet {
    return normalizeEVSet(input);
  }

  static createEmptySet(): EVSet {
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
  }

  static createEmpty(): EVSet {
    return EV.createEmptySet();
  }

  toNumber(): number {
    return this.value;
  }
  equals(other: EV): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return `${this.value}`;
  }
}

export class EVDistribution {
  private readonly evs: EVSet;
  constructor(evs: Partial<Record<StatName, number>> = {}) {
    this.evs = normalizeEVSet(evs);
    Object.freeze(this.evs);
    Object.freeze(this);
  }
  static createEmpty(): EVDistribution {
    return new EVDistribution({});
  }
  static createEmptySet(): EVDistribution {
    return EVDistribution.createEmpty();
  }
  static createSet(evs: Partial<Record<StatName, number>>): EVDistribution {
    return new EVDistribution(evs);
  }
  get(stat: StatName): number {
    return this.evs[stat] ?? 0;
  }
  getAll(): EVSet {
    return { ...this.evs };
  }
  with(stat: StatName, value: number): EVDistribution {
    return new EVDistribution({ ...this.evs, [stat]: value });
  }
  total(): number {
    return sumEVs(this.evs);
  }
  remaining(): number {
    return MAX_EV_TOTAL - this.total();
  }
  toObject(): EVSet {
    return this.getAll();
  }
}

export const EVSet = EVDistribution;
