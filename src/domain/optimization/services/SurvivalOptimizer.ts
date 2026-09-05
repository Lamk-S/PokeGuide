import type { OptimizationProblem } from "../entities/OptimizationProblem";
import type { OptimizationResult } from "../types/OptimizationTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

type SurvivalSolution = Record<StatName, number>;

export const SurvivalOptimizer = {
  /**
   * Utiliza Branch and Bound (Poda) + Búsqueda Binaria.
   * Complejidad O(N log N) donde N es 64.
   *
   * @param problem El problema de optimización.
   * @param evaluator Función inyectada por el Caso de Uso que retorna true si el Pokémon sobrevive.
   * @param defenseType Indica si optimiza 'defense' o 'special-defense'.
   */
  optimize(
    problem: OptimizationProblem,
    evaluator: (hpEV: number, defEV: number) => boolean,
    defenseType: "defense" | "special-defense",
  ): OptimizationResult<SurvivalSolution> {
    const startTime = performance.now();

    // 1. Consume el objeto 'problem' para validar la restricción
    const survivalConstraint = problem.constraints.find(
      (c) =>
        c.variable === "survival_physical" || c.variable === "survival_special",
    );

    if (!survivalConstraint) {
      return {
        status: "Unsupported",
        solution: null,
        explanation: {
          objective: "Error de Optimización",
          constraintDescription: "N/A",
          solutionDescription:
            "No se encontró una restricción de supervivencia válida en el problema.",
          evidence: [],
        },
        metrics: { candidatesEvaluated: 0, executionTimeMs: 0 },
      };
    }

    // Espacio de búsqueda útil (0 y múltiplos de 4)
    const possibleEVs = [
      0,
      ...Array.from({ length: 63 }, (_, i) => (i + 1) * 4),
    ];

    let bestTotalEVs = Infinity;
    let bestPair: { hp: number; def: number } | null = null;
    let candidatesEvaluated = 0;

    // Iteración lineal sobre HP
    for (const hpEV of possibleEVs) {
      // Branch and Bound: Poda del árbol si el HP ya supera la mejor suma encontrada
      if (hpEV >= bestTotalEVs) {
        break;
      }

      // Búsqueda binaria sobre la Defensa para este HP en particular
      let low = 0;
      let high = possibleEVs.length - 1;
      let localBestDef: number | null = null;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const defEV = possibleEVs[mid];

        // Poda interna: Excede el presupuesto límite global (510) o el mejor actual
        if (hpEV + defEV > 510 || hpEV + defEV >= bestTotalEVs) {
          high = mid - 1;
          continue;
        }

        candidatesEvaluated++;
        const survives = evaluator(hpEV, defEV);

        if (survives) {
          localBestDef = defEV;
          high = mid - 1; // Sobrevive. Busca si puede sobrevivir con menos Defensa.
        } else {
          low = mid + 1; // No sobrevive. Necesita más Defensa.
        }
      }

      // Si encuentra una defensa válida, actualiza el óptimo global
      if (localBestDef !== null && hpEV + localBestDef < bestTotalEVs) {
        bestTotalEVs = hpEV + localBestDef;
        bestPair = { hp: hpEV, def: localBestDef };
      }
    }

    const executionTimeMs = performance.now() - startTime;

    if (!bestPair) {
      return {
        status: "NoSolution",
        solution: null,
        explanation: null,
        metrics: { candidatesEvaluated, executionTimeMs },
      };
    }

    const solution: SurvivalSolution = {
      hp: bestPair.hp,
      attack: 0,
      defense: defenseType === "defense" ? bestPair.def : 0,
      "special-attack": 0,
      "special-defense": defenseType === "special-defense" ? bestPair.def : 0,
      speed: 0,
    };

    return {
      status: "Optimal",
      solution,
      explanation: {
        objective:
          "Sobrevivir al ataque objetivo invirtiendo el mínimo de EVs posibles.",
        constraintDescription: `${survivalConstraint.variable} ${survivalConstraint.operator} ${survivalConstraint.target}`,
        solutionDescription: `Se requieren ${bestPair.hp} EVs en HP y ${bestPair.def} EVs en ${defenseType} (Total: ${bestTotalEVs}).`,
        evidence: [
          `La combinación ${bestPair.hp} HP / ${bestPair.def} Def es matemáticamente la inversión mínima requerida.`,
        ],
      },
      metrics: { candidatesEvaluated, executionTimeMs },
    };
  },
};
