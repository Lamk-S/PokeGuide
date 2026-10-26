export type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";
export type EVRecord = Record<StatKey, number>;

const STAT_KEYS: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
const MAX_PER_STAT = 252;
const MAX_TOTAL = 510;

function clamp(v: number): number {
  return Math.max(0, Math.min(MAX_PER_STAT, Math.floor(v)));
}

function normalize(record: EVRecord): EVRecord {
  let total = (Object.values(record) as number[]).reduce((a, b) => a + b, 0);
  if (total <= MAX_TOTAL) return record;
  const res = { ...record };
  for (let i = STAT_KEYS.length - 1; i >= 0 && total > MAX_TOTAL; i--) {
    const k = STAT_KEYS[i] as StatKey;
    const over = total - MAX_TOTAL;
    const cur = res[k] ?? 0;
    const red = Math.min(cur, over);
    res[k] = cur - red;
    total -= red;
  }
  return res;
}

export class EVDistribution {
  private readonly _evs: EVRecord;

  constructor(evs: Partial<EVRecord> | EVRecord) {
    const base: EVRecord = {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
    for (const k of STAT_KEYS) {
      const raw = (evs as EVRecord)[k] ?? 0;
      base[k] = clamp(raw);
    }
    this._evs = normalize(base);
  }

  get evs(): EVRecord {
    return { ...this._evs };
  }

  get(stat: StatKey): number {
    return this._evs[stat] ?? 0;
  }

  getAll(): EVRecord {
    return { ...this._evs };
  }

  total(): number {
    return (Object.values(this._evs) as number[]).reduce((a, b) => a + b, 0);
  }

  remaining(): number {
    return MAX_TOTAL - this.total();
  }

  toRecord(): EVRecord {
    return this.getAll();
  }

  toObject(): EVRecord {
    return this.getAll();
  }

  equals(other: EVDistribution): boolean {
    return STAT_KEYS.every((k) => this._evs[k] === other._evs[k]);
  }

  with(stat: StatKey, value: number): EVDistribution {
    return new EVDistribution({ ...this._evs, [stat]: value });
  }

  isValid(): boolean {
    const t = this.total();
    return (
      t <= MAX_TOTAL &&
      STAT_KEYS.every((k) => {
        const v = this._evs[k] ?? 0;
        return v >= 0 && v <= MAX_PER_STAT;
      })
    );
  }

  static empty(): EVDistribution {
    return new EVDistribution({
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    });
  }

  static create(record: Partial<EVRecord> | EVRecord): EVDistribution {
    return new EVDistribution(record);
  }

  static createEmpty(): EVDistribution {
    return EVDistribution.empty();
  }

  static createEmptySet(): EVDistribution {
    return EVDistribution.empty();
  }

  static createSet(record: Partial<EVRecord> | EVRecord): EVDistribution {
    return new EVDistribution(record);
  }
}
