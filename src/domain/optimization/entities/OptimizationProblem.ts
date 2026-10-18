import type { StatName } from "../types/OptimizationTypes";

export type OptimizationObjective = {
  readonly type: "ev_investment";
  readonly direction: "minimize";
};

export type OptimizationConstraint = {
  readonly variable: StatName | "survival_physical" | "survival_special";
  readonly operator: "gte";
  readonly target: number;
};

export type NatureContext = {
  readonly name: string;
  readonly nameEs: string;
  readonly increasedStat: StatName | null;
  readonly decreasedStat: StatName | null;
};

export type OptimizationContext = {
  readonly baseStats: Record<StatName, number>;
  readonly ivs: Record<StatName, number>;
  readonly level: number;
  readonly nature: NatureContext;
  readonly generation: number;
  readonly currentEVs?: Partial<Record<StatName, number>>;
};

export class OptimizationProblem {
  constructor(
    public readonly objective: OptimizationObjective,
    public readonly constraints: OptimizationConstraint[],
    public readonly context: OptimizationContext,
  ) {
    this.validate();
  }

  private validate(): void {
    const { baseStats, ivs, level, generation, currentEVs } = this.context;
    const required: StatName[] = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ];
    for (const s of required) {
      const bs = baseStats[s];
      if (bs === undefined || !Number.isFinite(bs) || bs <= 0)
        throw new Error(`baseStats ${s} inválido`);
      const iv = ivs[s];
      if (iv === undefined || !Number.isInteger(iv) || iv < 0 || iv > 31)
        throw new Error(`IV ${s} inválido`);
    }
    if (!Number.isInteger(level) || level < 1 || level > 100)
      throw new Error(`Nivel inválido ${level}`);
    if (!Number.isInteger(generation) || generation < 1 || generation > 9)
      throw new Error(`Generación inválida ${generation}`);
    if (currentEVs) {
      for (const [k, v] of Object.entries(currentEVs)) {
        if (!required.includes(k as StatName))
          throw new Error(`EV stat desconocida ${k}`);
        if (v === undefined) continue;
        if (
          !Number.isFinite(v) ||
          !Number.isInteger(v) ||
          v < 0 ||
          v > 252 ||
          v % 4 !== 0
        ) {
          throw new Error(`EV ${k} inválido ${v}`);
        }
      }
      const total = Object.values(currentEVs).reduce((a, b) => a + (b ?? 0), 0);
      if (total > 510)
        throw new Error(`Total EVs actuales ${total} excede 510`);
    }
  }

  getSpeedTarget(): number | null {
    const c = this.constraints.find((x) => x.variable === "speed");
    return c ? c.target : null;
  }

  getSurvivalTarget(): number | null {
    const c = this.constraints.find(
      (x) =>
        x.variable === "survival_physical" || x.variable === "survival_special",
    );
    return c ? c.target : null;
  }

  getOtherEVsTotal(exclude: StatName | StatName[]): number {
    const excludeSet = new Set(Array.isArray(exclude) ? exclude : [exclude]);
    let sum = 0;
    const cur = this.context.currentEVs ?? {};
    for (const [k, v] of Object.entries(cur)) {
      if (excludeSet.has(k as StatName)) continue;
      sum += v ?? 0;
    }
    return sum;
  }
}
