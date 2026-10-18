import { EV_STEPS } from "../types/OptimizationTypes";
import type { OptimizationProblem } from "../entities/OptimizationProblem";
import type {
  DamageOptimizationResult,
  OffensiveStat,
  StatName,
} from "../types/OptimizationTypes";
export type DamageEvaluator = (ev: number) => number | null;

export function optimizeDamage(
  problem: OptimizationProblem,
  evaluator: DamageEvaluator,
  offensiveStat: OffensiveStat = "attack",
): DamageOptimizationResult {
  const start = performance.now();
  const c = problem.constraints.find((x) => x.variable === offensiveStat);
  const target = c?.target ?? problem.constraints[0]?.target ?? 100;
  if (!Number.isFinite(target) || target <= 0)
    return {
      status: "Unsupported",
      solution: null,
      achievedPercent: null,
      target,
      explanation: { summary: `Objetivo inválido ${target}`, evidence: [] },
      metrics: { candidatesEvaluated: 0, iterations: 0, prunedBranches: 0 },
      proof: null,
      offensiveStat,
    };
  const otherTotal = problem.getOtherEVsTotal(offensiveStat as StatName);
  const maxAvail = Math.min(252, 510 - otherTotal);
  if (maxAvail < 0)
    return {
      status: "Infeasible",
      solution: null,
      achievedPercent: null,
      target,
      explanation: {
        summary: `Presupuesto excedido ${otherTotal}`,
        evidence: [],
      },
      metrics: {
        candidatesEvaluated: 0,
        iterations: 0,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
      proof: null,
      offensiveStat,
    };
  const feasible = EV_STEPS.filter((ev) => ev <= maxAvail);
  let evals = 0,
    bestEv: number | null = null,
    bestDmg: number | null = null,
    lastFail: { ev: number; dmg: number } | null = null,
    firstPass: { ev: number; dmg: number } | null = null;
  const hist: { ev: number; dmg: number | null; pass: boolean }[] = [];
  // check monotonic
  let prevDmg: number | null = null,
    isMono = true;
  for (let i = 0; i < feasible.length; i += 8) {
    const ev = feasible[i] as number;
    const d = evaluator(ev);
    evals++;
    if (d !== null) {
      if (prevDmg !== null && d < prevDmg - 0.001) {
        isMono = false;
        break;
      }
      prevDmg = d;
    }
  }
  evals = 0;
  if (isMono) {
    let low = 0,
      high = feasible.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const ev = feasible[mid] as number;
      const dmg = evaluator(ev);
      evals++;
      if (dmg === null) {
        hist.push({ ev, dmg: null, pass: false });
        low = mid + 1;
        continue;
      }
      const pass = dmg >= target;
      hist.push({ ev, dmg, pass });
      if (pass) {
        bestEv = ev;
        bestDmg = dmg;
        firstPass = { ev, dmg };
        high = mid - 1;
      } else {
        lastFail = { ev, dmg };
        low = mid + 1;
      }
    }
  } else {
    for (const ev of feasible) {
      const d = evaluator(ev as number);
      evals++;
      if (d === null) {
        hist.push({ ev: ev as number, dmg: null, pass: false });
        continue;
      }
      const pass = d >= target;
      hist.push({ ev: ev as number, dmg: d, pass });
      if (pass) {
        bestEv = ev as number;
        bestDmg = d;
        firstPass = { ev: ev as number, dmg: d };
        break;
      } else lastFail = { ev: ev as number, dmg: d };
    }
  }
  if (bestEv !== null && bestDmg !== null) {
    const idx = feasible.indexOf(bestEv);
    if (idx > 0 && !lastFail) {
      const prev = feasible[idx - 1] as number;
      const pd = evaluator(prev);
      evals++;
      if (pd !== null) lastFail = { ev: prev, dmg: pd };
    }
    const evd: string[] = [];
    if (lastFail)
      evd.push(`${lastFail.ev} EV → ${lastFail.dmg.toFixed(1)}% — no alcanza`);
    if (firstPass)
      evd.push(`${firstPass.ev} EV → ${firstPass.dmg.toFixed(1)}% — cumple`);
    return {
      status: "Optimal",
      solution: bestEv,
      achievedPercent: bestDmg,
      target,
      explanation: {
        summary: lastFail
          ? `Con ${lastFail.ev} EVs ${lastFail.dmg.toFixed(1)}% insuficiente. Con ${bestEv} EVs ${bestDmg.toFixed(1)}% cumple.`
          : `Objetivo ${target}% con ${bestEv} EVs`,
        evidence: evd,
      },
      metrics: {
        candidatesEvaluated: evals,
        iterations: evals,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
      proof: {
        failingCandidate: lastFail
          ? { ev: lastFail.ev, percent: lastFail.dmg, dmg: lastFail.dmg }
          : null,
        passingCandidate: firstPass
          ? { ev: firstPass.ev, percent: firstPass.dmg, dmg: firstPass.dmg }
          : null,
      },
      offensiveStat,
    };
  }
  const maxEv = feasible[feasible.length - 1] ?? 0;
  const maxDmg = feasible.length ? evaluator(maxEv) : null;
  return {
    status: "Infeasible",
    solution: null,
    achievedPercent: maxDmg,
    target,
    explanation: {
      summary:
        maxDmg !== null
          ? `Inalcanzable: ${target}% > ${maxDmg.toFixed(1)}% máximo con ${maxEv} EVs`
          : `Evaluador sin valores válidos`,
      evidence: hist
        .filter((h) => h.dmg !== null)
        .map(
          (h) => `${h.ev} EV → ${(h.dmg as number).toFixed(1)}% — no alcanza`,
        ),
    },
    metrics: {
      candidatesEvaluated: evals,
      iterations: evals,
      prunedBranches: 0,
      executionTimeMs: performance.now() - start,
    },
    proof: {
      failingCandidate:
        maxDmg !== null ? { ev: maxEv, percent: maxDmg, dmg: maxDmg } : null,
      passingCandidate: null,
    },
    offensiveStat,
  };
}
export const DamageOptimizer = { EV_STEPS, optimize: optimizeDamage };
