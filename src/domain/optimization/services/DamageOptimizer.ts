import type { BaseStats, Nature } from "@/domain/stats/services/StatCalculator";
import {
  calculateStats,
  normalizeEVSet,
} from "@/domain/stats/services/StatCalculator";
import type { StatName } from "@/domain/stats/value-objects/EV";
import type { OptimizationProblem } from "../entities/OptimizationProblem";

export type OffensiveStat = StatName;
export type DamageEvaluator = (
  offensiveEV: number,
  targetPercent: number,
) => boolean;

export interface DamageOptimizationInput {
  baseStats: BaseStats;
  level: number;
  nature: Nature;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
  generation: number;
  offensiveStat: OffensiveStat;
  targetPercent: number;
}

export interface DamageOptimizationResult {
  status: "Optimal" | "Infeasible";
  solution: number | null;
  achievedPercent: number;
  target: number;
  explanation?: { evidence: string[]; summary: string };
  metrics?: { candidatesEvaluated: number };
}

function extractProblem(problem: OptimizationProblem): DamageOptimizationInput {
  const ctx = problem.context as unknown as {
    baseStats: BaseStats;
    ivs: Record<StatName, number>;
    level: number;
    nature: Nature;
    generation: number;
    currentEVs: Record<StatName, number>;
  };
  const constraint = problem.constraints[0] as {
    variable: string;
    target: number;
  };
  return {
    baseStats: ctx.baseStats,
    ivs: ctx.ivs,
    level: ctx.level,
    nature: ctx.nature,
    evs: ctx.currentEVs ?? {},
    generation: ctx.generation,
    offensiveStat: "attack",
    targetPercent: constraint.target,
  };
}

export function optimizeDamage(
  problemOrInput: OptimizationProblem | DamageOptimizationInput,
  evaluator?: DamageEvaluator,
  offensiveStat?: OffensiveStat,
): DamageOptimizationResult {
  let input: DamageOptimizationInput;
  if ((problemOrInput as OptimizationProblem).context) {
    input = extractProblem(problemOrInput as OptimizationProblem);
    if (offensiveStat) input.offensiveStat = offensiveStat;
  } else {
    input = problemOrInput as DamageOptimizationInput;
  }

  const evalFn = evaluator ?? ((ev: number) => ev >= 0);
  let candidatesEvaluated = 0;

  for (let ev = 0; ev <= 252; ev += 4) {
    candidatesEvaluated++;
    const testEVs = normalizeEVSet({ ...input.evs, [input.offensiveStat]: ev });
    calculateStats({
      baseStats: input.baseStats,
      level: input.level,
      nature: input.nature,
      ivs: input.ivs,
      evs: testEVs,
      generation: input.generation,
    });
    if (evalFn(ev, input.targetPercent)) {
      return {
        status: "Optimal",
        solution: ev,
        achievedPercent: input.targetPercent,
        target: input.targetPercent,
        explanation: {
          evidence: [`${ev} EVs alcanza ${input.targetPercent}%`],
          summary: `Mínimo ${ev} EVs`,
        },
        metrics: { candidatesEvaluated },
      };
    }
  }

  return {
    status: "Infeasible",
    solution: null,
    achievedPercent: 0,
    target: input.targetPercent,
    explanation: { evidence: ["No alcanza"], summary: "Infeasible" },
    metrics: { candidatesEvaluated },
  };
}

export class DamageOptimizer {
  optimize(
    problem: OptimizationProblem,
    evaluator: DamageEvaluator,
    offensiveStat: OffensiveStat,
  ): DamageOptimizationResult {
    return optimizeDamage(problem, evaluator, offensiveStat);
  }

  static optimize(
    problem: OptimizationProblem,
    evaluator: DamageEvaluator,
    offensiveStat: OffensiveStat,
  ): DamageOptimizationResult {
    return optimizeDamage(problem, evaluator, offensiveStat);
  }
}
