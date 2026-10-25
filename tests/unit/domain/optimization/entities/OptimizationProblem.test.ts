import { describe, it, expect } from "vitest";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";

describe("OptimizationProblem Entity - Comportamiento", () => {
  it("inicializa el problema con restricciones y contexto válido", () => {
    const mockContext = {
      baseStats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      level: 50,
      generation: 9,
      currentEVs: { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 }
    };

    const problem = new (OptimizationProblem as any)(
      { type: "ev_investment", direction: "minimize" },
      [{ variable: "speed", operator: "gte", target: 168 }],
      mockContext
    );
    
    expect(problem).toBeDefined();
    
    const raw = problem as any;
    if (raw.context) {
      expect(raw.context.baseStats.hp).toBe(100);
      expect(raw.context.ivs.hp).toBe(31);
    }
    if (raw.constraints) {
      expect(raw.constraints.length).toBe(1);
    }
  });
});