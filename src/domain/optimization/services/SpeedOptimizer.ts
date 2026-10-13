import type { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { OptimizationResult } from "@/domain/optimization/types/OptimizationTypes";

const EV_STEPS: number[] = Array.from({ length: 64 }, (_, i) => i * 4);

export const SpeedOptimizer = {
  optimize(problem: OptimizationProblem): OptimizationResult<number> {
    const constraint = problem.constraints[0];
    if (constraint?.variable !== "speed") {
      throw new Error("SpeedOptimizer requires speed constraint");
    }
    const target = constraint.target;
    const { baseStats, ivs, level, nature } = problem.context;

    let low = 0;
    let high = EV_STEPS.length - 1;
    let optimalEV: number | null = null;
    let failEV: number | null = null;
    let evaluated = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testEV = EV_STEPS[mid];
      if (testEV === undefined) break;
      evaluated++;

      const stats = calculateStats({
        baseStats,
        level,
        nature,
        ivs,
        evs: {
          hp: 0,
          attack: 0,
          defense: 0,
          "special-attack": 0,
          "special-defense": 0,
          speed: testEV,
        },
        generation: problem.context.generation,
      });

      if (stats.speed >= target) {
        optimalEV = testEV;
        high = mid - 1;
      } else {
        failEV = testEV;
        low = mid + 1;
      }
    }

    if (optimalEV === null) {
      return {
        status: "Infeasible",
        solution: null,
        explanation: { summary: "No alcanza", evidence: [] },
        metrics: { candidatesEvaluated: evaluated },
      };
    }

    const failEvidence =
      failEV !== null
        ? `${failEV} EV → ${target - 1} Speed ❌`
        : "0 EV → insuficiente ❌";
    const successEvidence = `${optimalEV} EV → ${target} Speed ✅`;

    return {
      status: "Optimal",
      solution: optimalEV,
      explanation: {
        summary: `Mínimo ${optimalEV} EVs`,
        evidence: [failEvidence, successEvidence],
      },
      metrics: { candidatesEvaluated: evaluated },
    };
  },
};
