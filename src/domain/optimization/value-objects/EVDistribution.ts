export type EVStatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export const EV_STATS: readonly EVStatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

const STAT_SET = new Set<string>(EV_STATS);
const MAX_SINGLE = 252;
const MAX_TOTAL = 510;

function assertFinite(n: number, label: string): void {
  if (!Number.isFinite(n))
    throw new Error(`EV ${label} debe ser finito, recibido ${n}`);
}
function assertInt(n: number, label: string): void {
  if (!Number.isInteger(n))
    throw new Error(`EV ${label} debe ser entero, recibido ${n}`);
}

export class EVDistribution {
  private readonly evs: Record<EVStatName, number>;

  constructor(input: Partial<Record<EVStatName, number>> = {}) {
    for (const k of Object.keys(input)) {
      if (!STAT_SET.has(k)) throw new Error(`Stat desconocida: ${k}`);
    }
    const normalized: Record<EVStatName, number> = {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    };
    for (const stat of EV_STATS) {
      const raw = input[stat];
      const v = raw ?? 0;
      assertFinite(v, stat);
      assertInt(v, stat);
      if (v < 0) throw new Error(`EV ${stat} no puede ser negativo (${v})`);
      if (v > MAX_SINGLE)
        throw new Error(`EV ${stat} excede ${MAX_SINGLE} (${v})`);
      if (v % 4 !== 0)
        throw new Error(`EV ${stat} debe ser múltiplo de 4 (${v})`);
      normalized[stat] = v;
    }
    const total = Object.values(normalized).reduce((a, b) => a + b, 0);
    if (total > MAX_TOTAL)
      throw new Error(`Total EVs ${total} excede ${MAX_TOTAL}`);
    this.evs = normalized;
  }

  static empty(): EVDistribution {
    return new EVDistribution({});
  }

  static fromRecord(r: Record<string, number>): EVDistribution {
    const parsed: Partial<Record<EVStatName, number>> = {};
    for (const s of EV_STATS) {
      if (typeof r[s] === "number") parsed[s] = r[s];
    }
    return new EVDistribution(parsed);
  }

  get(stat: EVStatName): number {
    if (!STAT_SET.has(stat)) throw new Error(`Stat desconocida: ${stat}`);
    return this.evs[stat];
  }

  getAll(): Record<EVStatName, number> {
    return { ...this.evs };
  }

  total(): number {
    return (Object.values(this.evs) as number[]).reduce((a, b) => a + b, 0);
  }

  remaining(): number {
    return MAX_TOTAL - this.total();
  }

  with(stat: EVStatName, value: number): EVDistribution {
    if (!STAT_SET.has(stat)) throw new Error(`Stat desconocida: ${stat}`);
    assertFinite(value, stat);
    assertInt(value, stat);
    if (value < 0 || value > MAX_SINGLE)
      throw new Error(`EV ${stat} fuera de rango`);
    if (value % 4 !== 0) throw new Error(`EV ${stat} debe ser múltiplo de 4`);
    return new EVDistribution({ ...this.evs, [stat]: value });
  }

  merge(p: Partial<Record<EVStatName, number>>): EVDistribution {
    return new EVDistribution({ ...this.evs, ...p });
  }

  equals(o: EVDistribution): boolean {
    return EV_STATS.every((s) => this.evs[s] === o.evs[s]);
  }
}
