import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { EV_STEPS } from "../types/OptimizationTypes";
import type { OptimizationProblem } from "../entities/OptimizationProblem";
import type {
  SpeedOptimizationResult,
  StatName,
} from "../types/OptimizationTypes";

function buildEVs(
  speedEV: number,
  cur?: Partial<Record<StatName, number>>,
): Record<StatName, number> {
  return {
    hp: cur?.hp ?? 0,
    attack: cur?.attack ?? 0,
    defense: cur?.defense ?? 0,
    "special-attack": cur?.["special-attack"] ?? 0,
    "special-defense": cur?.["special-defense"] ?? 0,
    speed: speedEV,
  };
}

function toCalcNature(n: OptimizationProblem["context"]["nature"]) {
  return {
    name: n.name,
    nameEs: n.nameEs,
    increasedStat: n.increasedStat,
    decreasedStat: n.decreasedStat,
  };
}

function calcSpeed(ev: number, ctx: OptimizationProblem["context"]): number {
  const evs = buildEVs(ev, ctx.currentEVs);
  const nature = toCalcNature(ctx.nature);
  const result = calculateStats({
    baseStats: ctx.baseStats,
    level: ctx.level,
    nature,
    ivs: ctx.ivs,
    evs,
    generation: ctx.generation,
  });
  return (result as Record<StatName, number>).speed ?? 0;
}

export function optimizeSpeed(
  problem: OptimizationProblem,
): SpeedOptimizationResult {
  const start = performance.now();
  const target = problem.getSpeedTarget();

  if (target === null) {
    return {
      status: "Unsupported",
      solution: null,
      achievedStat: null,
      target: 0,
      explanation: {
        summary: "Sin objetivo de velocidad definido",
        evidence: [],
      },
      metrics: { candidatesEvaluated: 0, iterations: 0, prunedBranches: 0 },
      proof: null,
    };
  }

  if (!Number.isFinite(target) || target <= 0) {
    return {
      status: "Unsupported",
      solution: null,
      achievedStat: null,
      target,
      explanation: { summary: `Objetivo inválido ${target}`, evidence: [] },
      metrics: { candidatesEvaluated: 0, iterations: 0, prunedBranches: 0 },
      proof: null,
    };
  }

  const otherTotal = problem.getOtherEVsTotal("speed");
  const maxAvailable = Math.min(252, 510 - otherTotal);

  if (maxAvailable < 0) {
    return {
      status: "Infeasible",
      solution: null,
      achievedStat: null,
      target,
      explanation: {
        summary: `Presupuesto excedido: otros EVs suman ${otherTotal}`,
        evidence: [`Otros EVs ${otherTotal} > 510`],
      },
      metrics: {
        candidatesEvaluated: 0,
        iterations: 0,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
      proof: null,
    };
  }

  const feasible = EV_STEPS.filter((ev) => ev <= maxAvailable);

  if (feasible.length === 0) {
    return {
      status: "Infeasible",
      solution: null,
      achievedStat: null,
      target,
      explanation: { summary: `Sin presupuesto para Speed`, evidence: [] },
      metrics: {
        candidatesEvaluated: 0,
        iterations: 0,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
      proof: null,
    };
  }

  let low = 0;
  let high = feasible.length - 1;
  let bestIdx = -1;
  let bestStat: number | null = null;
  let evals = 0;
  let lastFail: { ev: number; stat: number } | null = null;
  let firstPass: { ev: number; stat: number } | null = null;
  const history: Array<{ ev: number; stat: number; pass: boolean }> = [];

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const ev = feasible[mid] as number;
    const stat = calcSpeed(ev, problem.context);
    evals++;
    const pass = stat >= target;
    history.push({ ev, stat, pass });
    if (pass) {
      bestIdx = mid;
      bestStat = stat;
      firstPass = { ev, stat };
      high = mid - 1;
    } else {
      lastFail = { ev, stat };
      low = mid + 1;
    }
  }

  if (bestIdx !== -1) {
    const bestEv = feasible[bestIdx] as number;
    if (bestIdx > 0 && !lastFail) {
      const prevEv = feasible[bestIdx - 1] as number;
      const prevStat = calcSpeed(prevEv, problem.context);
      evals++;
      lastFail = { ev: prevEv, stat: prevStat };
      history.push({ ev: prevEv, stat: prevStat, pass: false });
    }
    const evidence: string[] = [];
    if (lastFail)
      evidence.push(`${lastFail.ev} EV → ${lastFail.stat} Speed — no alcanza`);
    if (firstPass)
      evidence.push(`${firstPass.ev} EV → ${firstPass.stat} Speed — cumple`);
    return {
      status: "Optimal",
      solution: bestEv,
      achievedStat: bestStat,
      target,
      explanation: {
        summary: lastFail
          ? `Con ${lastFail.ev} EVs llegas a ${lastFail.stat}, insuficiente para ${target}. Con ${bestEv} EVs alcanzas ${bestStat}.`
          : `Objetivo ${target} alcanzado con ${bestEv} EVs (${bestStat} Speed).`,
        evidence,
      },
      metrics: {
        candidatesEvaluated: evals,
        iterations: evals,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
      proof: { failingCandidate: lastFail, passingCandidate: firstPass },
    };
  }

  const maxEv = feasible[feasible.length - 1] as number;
  const maxStat = calcSpeed(maxEv, problem.context);
  return {
    status: "Infeasible",
    solution: null,
    achievedStat: maxStat,
    target,
    explanation: {
      summary: `Inalcanzable: ${target} Speed > ${maxStat} máximo con ${maxEv} EVs`,
      evidence: history.map((h) => `${h.ev} EV → ${h.stat} Speed — no alcanza`),
    },
    metrics: {
      candidatesEvaluated: evals,
      iterations: evals,
      prunedBranches: 0,
      executionTimeMs: performance.now() - start,
    },
    proof: {
      failingCandidate: { ev: maxEv, stat: maxStat },
      passingCandidate: null,
    },
  };
}

export const SpeedOptimizer = { EV_STEPS, optimize: optimizeSpeed };
