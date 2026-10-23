import {
  calculateStats,
  normalizeEVSet,
} from "@/domain/stats/services/StatCalculator";
import type { BaseStats, Nature } from "@/domain/stats/services/StatCalculator";
import type { StatName } from "@/domain/stats/value-objects/EV";
import type { OptimizationProblem } from "../entities/OptimizationProblem";

export type DefenseStat = "defense" | "special-defense";
export type SurvivalEvaluator = (hpEV: number, defEV: number) => boolean;

export interface SurvivalOptimizationInput {
  baseStats: BaseStats;
  level: number;
  nature: Nature;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
  generation: number;
  defenseStat: DefenseStat;
}

export interface SurvivalOptimizationResult {
  status: "Optimal" | "Infeasible";
  solution: { hp: number; defense?: number; specialDefense?: number } | null;
  totalEVs?: number;
  achievedHP?: number;
  achievedDef?: number;
  explanation?: { evidence: string[]; summary: string };
  metrics: { candidatesEvaluated: number };
}

function extractProblem(problem: OptimizationProblem): {
  input: SurvivalOptimizationInput;
} {
  const ctx = problem.context as unknown as {
    baseStats: BaseStats;
    ivs: Record<StatName, number>;
    level: number;
    nature: Nature;
    generation: number;
    currentEVs: Record<StatName, number>;
  };
  return {
    input: {
      baseStats: ctx.baseStats,
      ivs: ctx.ivs,
      level: ctx.level,
      nature: ctx.nature,
      evs: ctx.currentEVs ?? {},
      generation: ctx.generation,
      defenseStat: "defense",
    },
  };
}

function optimizeWithEvaluator(
  input: SurvivalOptimizationInput,
  evaluator: SurvivalEvaluator,
  defenseStat: DefenseStat,
): SurvivalOptimizationResult {
  let candidatesEvaluated = 0;

  const existsWithTotal = (
    total: number,
  ): { hp: number; def: number } | null => {
    const candidates: Array<{ hp: number; def: number }> = [];
    const t4 = Math.floor(total / 4) * 4;
    candidates.push({ hp: 0, def: t4 });
    candidates.push({ hp: t4, def: 0 });
    const half = Math.floor(t4 / 2 / 4) * 4;
    candidates.push({ hp: half, def: t4 - half });

    for (const c of candidates) {
      if (c.hp > 252 || c.def > 252 || c.hp < 0 || c.def < 0) continue;
      candidatesEvaluated++;
      if (evaluator(c.hp, c.def)) return c;
    }

    if (candidatesEvaluated < 80) {
      for (let hp = 0; hp <= Math.min(252, t4); hp += 16) {
        const def = t4 - hp;
        if (def < 0 || def > 252) continue;
        if (hp === 0 || hp === t4 || hp === half) continue;
        candidatesEvaluated++;
        if (evaluator(hp, def)) return { hp, def };
        if (candidatesEvaluated >= 80) break;
      }
    }

    return null;
  };

  let best: { hp: number; def: number } | null = null;
  let lowTotal = 0;
  let highTotal = 504;

  while (lowTotal <= highTotal) {
    const mid = Math.floor((lowTotal + highTotal) / 2 / 4) * 4;
    const found = existsWithTotal(mid);
    if (found) {
      best = found;
      highTotal = mid - 4;
    } else {
      lowTotal = mid + 4;
    }
  }

  if (best) {
    const evs = normalizeEVSet({
      hp: best.hp,
      [defenseStat]: best.def,
    } as Record<StatName, number>);
    const stats = calculateStats({
      baseStats: input.baseStats,
      level: input.level,
      nature: input.nature,
      ivs: input.ivs,
      evs,
      generation: input.generation,
    });
    const sol =
      defenseStat === "defense"
        ? { hp: best.hp, defense: best.def }
        : { hp: best.hp, specialDefense: best.def };
    return {
      status: "Optimal",
      solution: sol,
      totalEVs: best.hp + best.def,
      achievedHP: input.baseStats.hp === 1 ? 1 : stats.hp,
      achievedDef: stats[defenseStat],
      explanation: {
        evidence: [
          `Evaluador pasó con ${best.hp}+${best.def}=${best.hp + best.def}`,
        ],
        summary: `Óptimo ${best.hp + best.def} EVs`,
      },
      metrics: { candidatesEvaluated },
    };
  }

  return {
    status: "Infeasible",
    solution: null,
    metrics: { candidatesEvaluated },
  };
}

export function optimizeSurvival(
  problemOrInput: OptimizationProblem | SurvivalOptimizationInput,
  evaluator?: SurvivalEvaluator,
  defenseStat?: DefenseStat,
): SurvivalOptimizationResult {
  if ((problemOrInput as OptimizationProblem).context) {
    const problem = problemOrInput as OptimizationProblem;
    const defStat = (defenseStat ?? "defense") as DefenseStat;
    const evalFn = evaluator ?? ((hp: number, def: number) => hp + def >= 0);
    const { input } = extractProblem(problem);
    input.defenseStat = defStat;
    return optimizeWithEvaluator(input, evalFn, defStat);
  } else {
    const input = problemOrInput as SurvivalOptimizationInput;
    const defStat = (defenseStat ?? input.defenseStat) as DefenseStat;
    const evalFn = evaluator ?? (() => true);
    return optimizeWithEvaluator(input, evalFn, defStat);
  }
}

export class SurvivalOptimizer {
  static optimize(
    problem: OptimizationProblem,
    evaluator: SurvivalEvaluator,
    defenseStat: DefenseStat,
  ): SurvivalOptimizationResult {
    return optimizeSurvival(problem, evaluator, defenseStat);
  }
  optimize(
    input: SurvivalOptimizationInput,
    evaluator: SurvivalEvaluator,
    defenseStat: DefenseStat,
  ): SurvivalOptimizationResult {
    return optimizeSurvival(input, evaluator, defenseStat);
  }
}
