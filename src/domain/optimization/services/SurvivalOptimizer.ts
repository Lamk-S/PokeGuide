import type { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import type { OptimizationResult } from "@/domain/optimization/types/OptimizationTypes";

type DefenseStat = "defense" | "special-defense";
type Evaluator = (hpEV: number, defEV: number) => boolean;

const EV_STEPS = Array.from({ length: 64 }, (_, i) => i * 4);

type SurvivalSolution = {
  hp: number;
  defense: number;
  "special-defense"?: number;
};

function idxOf(ev: number): number {
  return Math.max(0, Math.min(63, Math.floor(ev / 4)));
}

function evAt(idx: number): number {
  const v = EV_STEPS[idx];
  return v ?? 0;
}

export const SurvivalOptimizer = {
  optimize(
    _problem: OptimizationProblem,
    evaluator: Evaluator,
    defenseStat: DefenseStat,
  ): OptimizationResult<SurvivalSolution> {
    let evaluated = 0;
    const cache = new Map<string, boolean>();

    function isFeasible(hp: number, def: number): boolean {
      if (hp < 0 || def < 0 || hp > 252 || def > 252) return false;
      if (hp + def > 510) return false;
      const key = `${hp}-${def}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      evaluated++;
      const res = evaluator(hp, def);
      cache.set(key, res);
      return res;
    }

    function findMinHpWithMaxDef(maxDef = 252): number {
      let lo = 0;
      let hi = EV_STEPS.length - 1;
      let ansIdx = -1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const hp = evAt(mid);
        if (isFeasible(hp, maxDef)) {
          ansIdx = mid;
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }
      return ansIdx === -1 ? -1 : evAt(ansIdx);
    }

    function findMinDefForHp(hp: number, hiDef = 252): number {
      const hiIdx = idxOf(hiDef);
      let lo = 0;
      let hi = hiIdx;
      let ansIdx = -1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const def = evAt(mid);
        if (isFeasible(hp, def)) {
          ansIdx = mid;
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }
      return ansIdx === -1 ? -1 : evAt(ansIdx);
    }

    const minHp = findMinHpWithMaxDef(252);
    if (minHp === -1) {
      return {
        status: "Infeasible",
        solution: null,
        explanation: { summary: "No sobrevive", evidence: [] },
        metrics: { candidatesEvaluated: evaluated },
      };
    }

    const minDefForMinHp = findMinDefForHp(minHp, 252);
    if (minDefForMinHp === -1) {
      return {
        status: "Infeasible",
        solution: null,
        explanation: { summary: "No sobrevive", evidence: [] },
        metrics: { candidatesEvaluated: evaluated },
      };
    }

    let best = minHp + minDefForMinHp;
    let bestHp = minHp;
    let bestDef = minDefForMinHp;

    const coarseStep = 4; // 16 EV
    for (
      let hpIdx = idxOf(minHp) + coarseStep;
      hpIdx < EV_STEPS.length;
      hpIdx += coarseStep
    ) {
      const hp = evAt(hpIdx);
      if (hp >= best) break;
      const maxDefToBeat = best - hp - 4;
      if (maxDefToBeat < 0) continue;
      const maxDefIdx = idxOf(maxDefToBeat);
      if (!isFeasible(hp, evAt(maxDefIdx))) continue;

      const def = findMinDefForHp(hp, maxDefToBeat);
      if (def !== -1 && hp + def < best) {
        best = hp + def;
        bestHp = hp;
        bestDef = def;
      }
    }

    const bestHpIdx = idxOf(bestHp);
    const fineRadius = coarseStep;
    const start = Math.max(0, bestHpIdx - fineRadius);
    const end = Math.min(EV_STEPS.length - 1, bestHpIdx + fineRadius);

    for (let hpIdx = start; hpIdx <= end; hpIdx++) {
      const hp = evAt(hpIdx);
      if (hp === bestHp) continue;
      if (hp >= best) continue;
      const maxDefToBeat = best - hp - 1;
      if (maxDefToBeat < 0) continue;
      if (!isFeasible(hp, evAt(idxOf(maxDefToBeat)))) continue;

      const def = findMinDefForHp(hp, maxDefToBeat);
      if (def !== -1 && hp + def < best) {
        best = hp + def;
        bestHp = hp;
        bestDef = def;
      }
    }

    const solution: SurvivalSolution =
      defenseStat === "defense"
        ? { hp: bestHp, defense: bestDef }
        : { hp: bestHp, defense: 0, "special-defense": bestDef };

    return {
      status: "Optimal",
      solution,
      explanation: {
        summary: `Óptimo ${best} EVs · HP ${bestHp} + ${defenseStat} ${bestDef}`,
        evidence: [
          `${bestHp}+${bestDef}=${best} sobrevive`,
          `${evaluated} evaluaciones`,
        ],
      },
      metrics: { candidatesEvaluated: evaluated },
    };
  },
};
