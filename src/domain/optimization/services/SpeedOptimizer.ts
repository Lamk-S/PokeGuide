import {
  calculateStats,
  normalizeEVSet,
} from "@/domain/stats/services/StatCalculator";
import type { BaseStats, Nature } from "@/domain/stats/services/StatCalculator";
import type { StatName } from "@/domain/stats/value-objects/EV";
import type { OptimizationProblem } from "../entities/OptimizationProblem";

export interface SpeedOptimizationInput {
  baseStats: BaseStats;
  level: number;
  nature: Nature;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
  target: number;
  generation: number;
}

export interface SpeedOptimizationResult {
  status: "Optimal" | "Infeasible";
  solution: number | null;
  achievedStat: number;
  target: number;
  explanation?: { evidence: string[]; summary: string };
  metrics?: { candidatesEvaluated: number };
}

function extractFromProblem(
  problem: OptimizationProblem,
): SpeedOptimizationInput {
  const ctx = problem.context as unknown as {
    baseStats: BaseStats;
    ivs: Record<StatName, number>;
    level: number;
    nature: Nature;
    generation: number;
    currentEVs: Record<StatName, number>;
  };
  const target = (problem.constraints[0] as { target: number }).target ?? 0;
  return {
    baseStats: ctx.baseStats,
    ivs: ctx.ivs,
    level: ctx.level,
    nature: ctx.nature,
    evs: ctx.currentEVs ?? {},
    target,
    generation: ctx.generation,
  };
}

function binarySearchSpeed(
  input: SpeedOptimizationInput,
): SpeedOptimizationResult {
  const { baseStats, level, nature, ivs, evs, target, generation } = input;
  const normalizedBase = normalizeEVSet(evs);
  let candidatesEvaluated = 0;
  const evidence: string[] = [];

  const calc = (ev: number) => {
    candidatesEvaluated++;
    const test = normalizeEVSet({ ...normalizedBase, speed: ev });
    const stats = calculateStats({
      baseStats,
      level,
      nature,
      ivs,
      evs: test,
      generation,
    });
    return stats.speed;
  };

  const speedAt240 = calc(240);
  evidence.push(
    `${240} EV → ${speedAt240} Speed — ${speedAt240 >= target ? "cumple" : "no alcanza"}`,
  );
  if (speedAt240 < target) {
    const speedAt244 = calc(244);
    evidence.push(
      `${244} EV → ${speedAt244} Speed — ${speedAt244 >= target ? "cumple" : "no alcanza"}`,
    );
    if (speedAt244 >= target) {
      return {
        status: "Optimal",
        solution: 244,
        achievedStat: speedAt244,
        target,
        explanation: { evidence, summary: `Mínimo 244 EVs para ${target}` },
        metrics: { candidatesEvaluated },
      };
    }
  }

  let low = 0;
  let high = 252;
  let best: number | null = null;
  let bestSpeed = 0;

  while (low <= high) {
    const mid = Math.floor(low + high) / 2;
    const midFloored = Math.floor(mid / 4) * 4;
    const speed = calc(midFloored);
    if (speed >= target) {
      best = midFloored;
      bestSpeed = speed;
      high = midFloored - 4;
    } else {
      low = midFloored + 4;
    }
  }

  if (best !== null) {
    return {
      status: "Optimal",
      solution: best,
      achievedStat: bestSpeed,
      target,
      explanation: { evidence, summary: `Mínimo ${best} EVs para ${target}` },
      metrics: { candidatesEvaluated },
    };
  }

  return {
    status: "Infeasible",
    solution: null,
    achievedStat: calc(252),
    target,
    explanation: { evidence, summary: "Imposible alcanzar objetivo" },
    metrics: { candidatesEvaluated },
  };
}

export function optimizeSpeed(
  input: SpeedOptimizationInput | OptimizationProblem,
): SpeedOptimizationResult {
  const normalizedInput = (input as OptimizationProblem).context
    ? extractFromProblem(input as OptimizationProblem)
    : (input as SpeedOptimizationInput);
  return binarySearchSpeed(normalizedInput);
}

export class SpeedOptimizer {
  static optimize(
    problem: OptimizationProblem | SpeedOptimizationInput,
  ): SpeedOptimizationResult {
    return optimizeSpeed(problem as never);
  }
  optimize(
    input: SpeedOptimizationInput | OptimizationProblem,
  ): SpeedOptimizationResult {
    return optimizeSpeed(input as never);
  }
}
