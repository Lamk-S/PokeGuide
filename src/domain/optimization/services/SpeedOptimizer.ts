import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { StatName } from "../types/OptimizationTypes";
import {
  EV_STEPS as BASE_EV_STEPS,
  type SpeedOptimizationResult,
  type OptimizationMetrics,
} from "../types/OptimizationTypes";
import type { OptimizationProblem } from "../entities/OptimizationProblem";

type Nature = {
  readonly name: string;
  readonly nameEs?: string;
  readonly increasedStat: StatName | null;
  readonly decreasedStat: StatName | null;
};

function buildEVs(
  speedEV: number,
  currentEVs?: Partial<Record<StatName, number>>,
): Record<StatName, number> {
  const base: Record<StatName, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };
  if (currentEVs) {
    for (const k of Object.keys(currentEVs) as StatName[]) {
      const v = currentEVs[k];
      if (typeof v === "number") {
        base[k] = v;
      }
    }
  }
  base.speed = speedEV;
  return base;
}

function calcSpeedForEV(
  ev: number,
  ctx: OptimizationProblem["context"],
): number {
  const evs = buildEVs(ev, ctx.currentEVs);
  const result = calculateStats({
    baseStats: ctx.baseStats as unknown as Record<string, number> &
      Record<StatName, number>,
    level: ctx.level,
    nature: ctx.nature as unknown as Nature,
    ivs: ctx.ivs as unknown as Record<string, number> &
      Record<StatName, number>,
    evs: evs as unknown as Record<string, number> & Record<StatName, number>,
    generation: ctx.generation,
  } as never);
  const speed = (result as Record<StatName, number>).speed;
  return typeof speed === "number" ? speed : 0;
}

function optimizeSpeed(problem: OptimizationProblem): SpeedOptimizationResult {
  const start = performance.now();
  const target = problem.getSpeedTarget();

  if (target === null || target === undefined) {
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

  let low = 0;
  let high = BASE_EV_STEPS.length - 1;
  let bestIdx = -1;
  let bestStat: number | null = null;
  let evaluations = 0;
  let lastFail: { ev: number; stat: number } | null = null;
  let firstPass: { ev: number; stat: number } | null = null;
  const history: Array<{ ev: number; stat: number; pass: boolean }> = [];

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const ev = BASE_EV_STEPS[mid];
    if (ev === undefined) break;
    const stat = calcSpeedForEV(ev, problem.context);
    evaluations++;
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
    const bestEvCandidate = BASE_EV_STEPS[bestIdx];
    if (bestEvCandidate === undefined) {
      return {
        status: "Infeasible",
        solution: null,
        achievedStat: null,
        target,
        explanation: {
          summary: `Imposible alcanzar ${target} Speed incluso con 252 EVs`,
          evidence: history.map(
            (h) => `${h.ev} EV → ${h.stat} Speed ${h.pass ? "✅" : "❌"}`,
          ),
        },
        metrics: {
          candidatesEvaluated: evaluations,
          iterations: evaluations,
          prunedBranches: 0,
          executionTimeMs: performance.now() - start,
        },
        proof: { failingCandidate: lastFail, passingCandidate: firstPass },
      };
    }
    const bestEv = bestEvCandidate;

    if (bestIdx > 0) {
      const prevEv = BASE_EV_STEPS[bestIdx - 1];
      if (prevEv !== undefined) {
        const isImmediateFail = lastFail !== null && lastFail.ev === prevEv;
        if (!isImmediateFail) {
          const prevStat = calcSpeedForEV(prevEv, problem.context);
          evaluations++;
          lastFail = { ev: prevEv, stat: prevStat };
          if (!history.some((h) => h.ev === prevEv)) {
            history.push({ ev: prevEv, stat: prevStat, pass: false });
          }
        }
      }
    }

    history.sort((a, b) => a.ev - b.ev);
    const evidence: string[] = [];
    if (lastFail)
      evidence.push(`${lastFail.ev} EV → ${lastFail.stat} Speed ❌`);
    if (firstPass)
      evidence.push(`${firstPass.ev} EV → ${firstPass.stat} Speed ✅`);
    if (evidence.length === 0 && firstPass) {
      evidence.push(
        `${firstPass.ev} EV → ${firstPass.stat} Speed ✅ (ya supera objetivo con 0 EVs)`,
      );
    }

    const metrics: OptimizationMetrics = {
      candidatesEvaluated: evaluations,
      iterations: evaluations,
      prunedBranches: 0,
      executionTimeMs: performance.now() - start,
    };

    const summary = lastFail
      ? `Con ${lastFail.ev} EVs llegas a ${lastFail.stat}, fallando por ${target - lastFail.stat} punto(s). Con ${bestEv} EVs llegas a ${bestStat ?? 0}, logrando la meta.`
      : `Objetivo ${target} alcanzado con ${bestEv} EVs (${bestStat ?? 0} Speed)`;

    return {
      status: "Optimal",
      solution: bestEv,
      achievedStat: bestStat,
      target,
      explanation: { summary, evidence },
      metrics,
      proof: { failingCandidate: lastFail, passingCandidate: firstPass },
    };
  }

  const lastStep = BASE_EV_STEPS[BASE_EV_STEPS.length - 1];
  const maxEv = lastStep ?? 252;
  const maxStat = calcSpeedForEV(maxEv, problem.context);

  return {
    status: "Infeasible",
    solution: null,
    achievedStat: maxStat,
    target,
    explanation: {
      summary: `Inalcanzable: ${target} Speed > ${maxStat} máximo con 252 EVs`,
      evidence: history.map((h) => `${h.ev} EV → ${h.stat} Speed ❌`),
    },
    metrics: {
      candidatesEvaluated: evaluations,
      iterations: evaluations,
      prunedBranches: 0,
      executionTimeMs: performance.now() - start,
    },
    proof: {
      failingCandidate: { ev: maxEv, stat: maxStat },
      passingCandidate: null,
    },
  };
}

export const SpeedOptimizer = {
  EV_STEPS: BASE_EV_STEPS,
  optimize: optimizeSpeed,
};

export { optimizeSpeed };
