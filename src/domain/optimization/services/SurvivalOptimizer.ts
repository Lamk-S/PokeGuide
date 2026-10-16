import {
  EV_STEPS as BASE_EV_STEPS,
  type SurvivalOptimizationResult,
  type SurvivalSolution,
  type DefenseStat,
} from "../types/OptimizationTypes";
import type { OptimizationProblem } from "../entities/OptimizationProblem";

type Evaluator = (hpEV: number, defEV: number) => boolean;

function optimizeSurvival(
  _problem: OptimizationProblem,
  evaluator: Evaluator,
  defenseStat: DefenseStat = "defense",
): SurvivalOptimizationResult {
  const start = performance.now();
  let bestTotal = Infinity;
  let bestSolution: SurvivalSolution | null = null;
  let candidatesEvaluated = 0;
  let prunedBranches = 0;
  let iterations = 0;
  let bestHpEv = 0;
  let bestDefEv = 0;

  for (let hpIdx = 0; hpIdx < BASE_EV_STEPS.length; hpIdx++) {
    const hpEv = BASE_EV_STEPS[hpIdx];
    if (hpEv === undefined) continue;
    iterations++;

    if (hpEv >= bestTotal) {
      prunedBranches += BASE_EV_STEPS.length - hpIdx;
      break;
    }

    candidatesEvaluated++;

    let low = 0;
    let high = BASE_EV_STEPS.length - 1;
    let bestDefEvForThisHp = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const defEv = BASE_EV_STEPS[mid];
      if (defEv === undefined) break;

      if (hpEv + defEv >= bestTotal && bestTotal !== Infinity) {
        high = mid - 1;
        continue;
      }

      const survives = evaluator(hpEv, defEv);
      if (survives) {
        bestDefEvForThisHp = defEv;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    if (bestDefEvForThisHp !== -1) {
      const total = hpEv + bestDefEvForThisHp;
      if (total < bestTotal) {
        bestTotal = total;
        bestHpEv = hpEv;
        bestDefEv = bestDefEvForThisHp;
        if (defenseStat === "defense") {
          bestSolution = {
            hp: hpEv,
            defense: bestDefEvForThisHp,
            totalEVs: total,
          };
        } else {
          bestSolution = {
            hp: hpEv,
            specialDefense: bestDefEvForThisHp,
            totalEVs: total,
            defense: bestDefEvForThisHp,
          } as SurvivalSolution;
        }
      }
    }
  }

  const end = performance.now();

  if (bestSolution) {
    return {
      status: "Optimal",
      solution: bestSolution,
      totalEVs: bestTotal,
      explanation: {
        summary: `Supervivencia óptima con ${bestTotal} EVs totales: ${bestHpEv} HP + ${bestDefEv} ${defenseStat === "defense" ? "Defensa" : "Def. Especial"}`,
        evidence: [
          `${bestHpEv} HP EV + ${bestDefEv} ${defenseStat} EV → sobrevive ✅`,
          `Total ${bestTotal} EVs minimiza inversión`,
          `Ramas podadas: ${prunedBranches}`,
        ],
      },
      metrics: {
        candidatesEvaluated,
        iterations,
        prunedBranches,
        executionTimeMs: end - start,
      },
    };
  }

  return {
    status: "Infeasible",
    solution: null,
    totalEVs: null,
    explanation: {
      summary:
        "No existe distribución de EVs que garantice supervivencia con 510 EVs máximos",
      evidence: [`Ramas podadas: ${prunedBranches}`],
    },
    metrics: {
      candidatesEvaluated,
      iterations,
      prunedBranches,
      executionTimeMs: end - start,
    },
  };
}

export const SurvivalOptimizer = {
  EV_STEPS: BASE_EV_STEPS,
  optimize: optimizeSurvival,
};

export { optimizeSurvival };
