import { describe, it, expect } from "vitest";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";

describe("SpeedOptimizer (Binary Search)", () => {
  it("encuentra 244 EVs como el mínimo para alcanzar 168 de Speed en Garchomp Nivel 50", () => {
    // Escenario Competitivo Real:
    // Garchomp (Base 102) intentando superar a un Base 100 con velocidad máxima (167).
    // Target Speed = 168.
    const problem = new OptimizationProblem(
      { type: "ev_investment", direction: "minimize" },
      [{ variable: "speed", operator: "gte", target: 168 }],
      {
        baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
        ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
        level: 50,
        nature: { name: "Jolly", increasedStat: "speed", decreasedStat: "special-attack" },
        generation: 9
      }
    );

    const result = SpeedOptimizer.optimize(problem);

    // El motor ahora sí encontrará una solución viable
    expect(result.status).toBe("Optimal");
    
    // Verificamos que la solución es el óptimo estricto (244)
    expect(result.solution).toBe(244); 
    
    // Verificamos la explicabilidad matemática (240 no llega, 244 sí)
    expect(result.explanation?.evidence[0]).toContain("240 EV → 167 Speed ❌");
    expect(result.explanation?.evidence[1]).toContain("244 EV → 168 Speed ✅");
    
    // Verificamos complejidad logarítmica (Binary search sobre 64 items debe tomar <= 6 iteraciones)
    expect(result.metrics.candidatesEvaluated).toBeLessThanOrEqual(6); 
  });
});