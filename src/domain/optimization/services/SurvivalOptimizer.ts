import { EV_STEPS } from "../types/OptimizationTypes";
import type { OptimizationProblem } from "../entities/OptimizationProblem";
import type {
  SurvivalOptimizationResult,
  SurvivalSolution,
  DefenseStat,
  StatName,
} from "../types/OptimizationTypes";
export type SurvivalEvaluator = (hpEV: number, defEV: number) => boolean;

export function optimizeSurvival(
  problem: OptimizationProblem,
  evaluator: SurvivalEvaluator,
  defenseStat: DefenseStat = "defense",
): SurvivalOptimizationResult {
  const start = performance.now();
  const otherTotal = problem.getOtherEVsTotal(["hp", defenseStat as StatName]);
  const remaining = 510 - otherTotal;
  if (remaining < 0)
    return {
      status: "Infeasible",
      solution: null,
      totalEVs: null,
      defenseStat,
      explanation: {
        summary: `Presupuesto excedido: otros EVs ${otherTotal}`,
        evidence: [],
      },
      metrics: {
        candidatesEvaluated: 0,
        iterations: 0,
        prunedBranches: 0,
        executionTimeMs: performance.now() - start,
      },
    };
  const feasibleHP = EV_STEPS.filter((ev) => ev <= 252 && ev <= remaining);
  const feasibleDef = EV_STEPS.filter((ev) => ev <= 252);
  let bestTotal = Infinity,
    best: SurvivalSolution | null = null,
    evals = 0,
    pruned = 0,
    iter = 0,
    bestHp = 0,
    bestDef = 0;
  const evidence: string[] = [];
  for (let hpIdx = 0; hpIdx < feasibleHP.length; hpIdx++) {
    const hpEv = feasibleHP[hpIdx] as number;
    iter++;
    if (hpEv >= bestTotal) {
      pruned += feasibleHP.length - hpIdx;
      break;
    }
    const budgetForDef = Math.min(252, remaining - hpEv);
    if (budgetForDef < 0) continue;
    let low = 0,
      high = feasibleDef.findIndex((ev) => ev > budgetForDef);
    if (high === -1) high = feasibleDef.length - 1;
    else high = high - 1;
    if (high < 0) continue;
    let bestDefForHp = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const defEv = feasibleDef[mid] as number;
      if (hpEv + defEv >= bestTotal) {
        high = mid - 1;
        continue;
      }
      const survives = evaluator(hpEv, defEv);
      evals++;
      if (survives) {
        bestDefForHp = defEv;
        high = mid - 1;
      } else low = mid + 1;
    }
    if (bestDefForHp !== -1) {
      const total = hpEv + bestDefForHp;
      if (total < bestTotal) {
        bestTotal = total;
        bestHp = hpEv;
        bestDef = bestDefForHp;
        best =
          defenseStat === "defense"
            ? { hp: hpEv, defense: bestDefForHp, totalEVs: total }
            : { hp: hpEv, specialDefense: bestDefForHp, totalEVs: total };
        evidence.unshift(
          `${hpEv} HP / ${bestDefForHp} ${defenseStat === "defense" ? "Def" : "SpD"} → cumple (${total} EVs)`,
        );
        if (evidence.length > 3) evidence.pop();
      }
    }
  }
  const end = performance.now();
  if (best)
    return {
      status: "Optimal",
      solution: best,
      totalEVs: bestTotal,
      defenseStat,
      explanation: {
        summary: `Supervivencia óptima con ${bestTotal} EVs: ${bestHp} HP + ${bestDef} ${defenseStat === "defense" ? "Defensa" : "Def. Especial"} — inversión mínima.`,
        evidence: [
          ...evidence,
          `Ramas podadas: ${pruned}`,
          `Presupuesto defensivo: ${remaining}`,
        ],
      },
      metrics: {
        candidatesEvaluated: evals,
        iterations: iter,
        prunedBranches: pruned,
        executionTimeMs: end - start,
      },
    };
  return {
    status: "Infeasible",
    solution: null,
    totalEVs: null,
    defenseStat,
    explanation: {
      summary: `No existe distribución defensiva con presupuesto ${remaining} EVs`,
      evidence: [
        `Ramas podadas: ${pruned}`,
        `Evaluaciones: ${evals} — ninguna cumple`,
      ],
    },
    metrics: {
      candidatesEvaluated: evals,
      iterations: iter,
      prunedBranches: pruned,
      executionTimeMs: end - start,
    },
  };
}
export const SurvivalOptimizer = { EV_STEPS, optimize: optimizeSurvival };
export { optimizeSurvival as optimizeSurvivalGeneric };
