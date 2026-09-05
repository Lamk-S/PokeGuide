import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { OptimizationProblem } from "../entities/OptimizationProblem";
import type { OptimizationResult } from "../types/OptimizationTypes";

export const SpeedOptimizer = {
  /**
   * Utiliza Búsqueda Binaria (Binary Search) sobre los EVs posibles (0 a 252, en pasos de 4).
   * La función es monotónica: mayor EV >= mayor Speed.
   */
  optimize(problem: OptimizationProblem): OptimizationResult<number> {
    const startTime = performance.now();
    const speedConstraint = problem.constraints.find(
      (c) => c.variable === "speed",
    );

    if (!speedConstraint) {
      return SpeedOptimizer.createErrorResult(
        "Restricción de velocidad no encontrada.",
      );
    }

    const targetSpeed = speedConstraint.target;

    // El espacio de búsqueda útil de EVs es 0, y luego múltiplos de 4 (4, 8, 12... 252).
    // Esto crea un array de 64 elementos.
    const possibleEVs = [
      0,
      ...Array.from({ length: 63 }, (_, i) => (i + 1) * 4),
    ];

    let low = 0;
    let high = possibleEVs.length - 1;
    let optimalEV: number | null = null;
    let candidatesEvaluated = 0;
    let finalSpeed = 0;
    let failSpeed = 0;
    let failEV = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const testEV = possibleEVs[mid];
      candidatesEvaluated++;

      const stats = calculateStats({
        ...problem.fixedContext,
        evs: {
          hp: 0,
          attack: 0,
          defense: 0,
          "special-attack": 0,
          "special-defense": 0,
          speed: testEV,
        },
      });

      if (stats.speed >= targetSpeed) {
        optimalEV = testEV;
        finalSpeed = stats.speed;
        // Busca si existe un valor aún menor
        high = mid - 1;
      } else {
        failEV = testEV;
        failSpeed = stats.speed;
        low = mid + 1;
      }
    }

    const executionTimeMs = performance.now() - startTime;

    if (optimalEV === null) {
      return {
        status: "NoSolution",
        solution: null,
        explanation: null,
        metrics: { candidatesEvaluated, executionTimeMs },
      };
    }

    const evidence = [];
    if (optimalEV > 0) {
      evidence.push(`${failEV} EV → ${failSpeed} Speed ❌`);
    }
    evidence.push(`${optimalEV} EV → ${finalSpeed} Speed ✅`);

    return {
      status: "Optimal",
      solution: optimalEV,
      explanation: {
        objective: "Reducir al mínimo los EVs de Speed.",
        constraintDescription: `Speed ≥ ${targetSpeed}`,
        solutionDescription: `${optimalEV} EV es la inversión mínima que satisface la restricción.`,
        evidence,
      },
      metrics: { candidatesEvaluated, executionTimeMs },
    };
  },

  createErrorResult(reason: string): OptimizationResult<number> {
    return {
      status: "Unsupported",
      solution: null,
      explanation: {
        objective: "Error de Optimización",
        constraintDescription: "N/A",
        solutionDescription: reason,
        evidence: [],
      },
      metrics: { candidatesEvaluated: 0, executionTimeMs: 0 },
    };
  },
};
