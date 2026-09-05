import { describe, it, expect } from "vitest";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SurvivalOptimizer } from "@/domain/optimization/services/SurvivalOptimizer";

describe("SurvivalOptimizer (Branch & Bound + Binary Search)", () => {
  it("encuentra la combinación óptima de HP y Defensa reduciendo evaluaciones", () => {
    const problem = new OptimizationProblem(
      { type: "ev_investment", direction: "minimize" },
      [{ variable: "survival_physical", operator: "gte", target: 1 }],
      {
        baseStats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
        ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
        level: 50,
        nature: { name: "Serious", increasedStat: null, decreasedStat: null },
        generation: 9
      }
    );

    // Mockeamos una función de evaluación. 
    // Supongamos que se requiere que la suma de HP EV y Def EV sea al menos 120 para sobrevivir.
    // El óptimo sería encontrar cualquier combinación que sume 120 exactamente. 
    const mockEvaluator = (hpEV: number, defEV: number) => {
      return (hpEV + defEV) >= 120;
    };

    const result = SurvivalOptimizer.optimize(problem, mockEvaluator, "defense");

    expect(result.status).toBe("Optimal");
    expect(result.solution?.hp! + result.solution?.defense!).toBe(120);
    
    // De 4096 combinaciones posibles, el algoritmo debería podar ramas y resolverlo en menos de 100 evaluaciones.
    expect(result.metrics.candidatesEvaluated).toBeLessThan(100); 
  });
});