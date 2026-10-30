import type {
  DefenseStat,
  SurvivalOptimizationResult,
  SurvivalSolution,
} from "../types/OptimizationTypes";
import { EV_STEPS } from "../types/OptimizationTypes";
export type BattleAwareEvaluator = (hpEV: number, defEV: number) => boolean;

export function optimizeSurvivalBattleAware(
  remainingBudget: number,
  evaluator: BattleAwareEvaluator,
  defenseStat: DefenseStat = "defense",
): SurvivalOptimizationResult {
  const start = performance.now();
  let evals = 0,
    best: SurvivalSolution | null = null,
    bestTotal = Infinity,
    evidence: string[] = [],
    pruned = 0;
  const feasibleHP = EV_STEPS.filter(
    (ev) => ev <= 252 && ev <= remainingBudget,
  );
  for (let hpIdx = 0; hpIdx < feasibleHP.length; hpIdx++) {
    const hpEv = feasibleHP[hpIdx] as number;
    if (hpEv >= bestTotal) {
      pruned += feasibleHP.length - hpIdx;
      break;
    }
    const budgetForDef = Math.min(252, remainingBudget - hpEv);
    const feasibleDef = EV_STEPS.filter((ev) => ev <= budgetForDef);
    let low = 0,
      high = feasibleDef.length - 1,
      bestDefForHp = -1;
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
        best =
          defenseStat === "defense"
            ? { hp: hpEv, defense: bestDefForHp, totalEVs: total }
            : { hp: hpEv, specialDefense: bestDefForHp, totalEVs: total };
        evidence.unshift(
          `${hpEv} HP / ${bestDefForHp} ${defenseStat === "defense" ? "Def" : "SpD"} → cumple`,
        );
        if (evidence.length > 5) evidence.pop();
      }
    }
  }
  const status = best ? "Optimal" : ("Infeasible" as const);
  return {
    status,
    solution: best,
    totalEVs: best?.totalEVs ?? null,
    defenseStat,
    explanation: {
      summary: best
        ? `Supervivencia battle-aware con ${best.totalEVs} EVs: ${best.hp} HP / ${best.defense ?? best.specialDefense} ${defenseStat === "defense" ? "Defensa" : "Def. Especial"}`
        : `No se encontró distribución con presupuesto ${remainingBudget} EVs`,
      evidence: evidence.length
        ? [...evidence, `Podadas: ${pruned}`]
        : [
            "Evaluación battle-aware sin propuesta — no alcanza",
            `Podadas: ${pruned}`,
          ],
    },
    metrics: {
      candidatesEvaluated: evals,
      iterations: evals,
      prunedBranches: pruned,
      executionTimeMs: performance.now() - start,
    },
  };
}
export const BattleAwareSurvivalOptimizer = {
  EV_STEPS,
  optimize: optimizeSurvivalBattleAware,
};
