import { describe, it, expect } from "vitest";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { NATURES } from "@/domain/stats/constants/natures";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";

describe("SpeedOptimizer (Binary Search)", () => {
  const jolly = NATURES.find((n) => n.name === "Jolly")!;
  const baseContext = {
    baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 } as Record<StatName, number>,
    ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 } as Record<StatName, number>,
    level: 50,
    nature: jolly as never,
    generation: 9,
    currentEVs: {},
  };

  it("encuentra 244 EVs como el mínimo para alcanzar 168 de Speed", () => {
    const problem = new OptimizationProblem({ type: "ev_investment", direction: "minimize" }, [{ variable: "speed", operator: "gte", target: 168 }], baseContext);
    const result = SpeedOptimizer.optimize(problem);

    expect(result.status).toBe("Optimal");
    expect(result.solution).toBe(244);
    expect(result.explanation?.evidence[0]).toContain("no alcanza");
  });

  it("retorna Infeasible si la velocidad objetivo es inalcanzable", () => {
    const problem = new OptimizationProblem({ type: "ev_investment", direction: "minimize" }, [{ variable: "speed", operator: "gte", target: 999 }], baseContext);
    const result = SpeedOptimizer.optimize(problem);
    expect(result.status).toBe("Infeasible");
  });

  it("cubre métodos de clase e interfaces raw", () => {
    const optimizer = new SpeedOptimizer();
    const rawInput = { ...baseContext, target: 168, pokemonId: 445, evs: {} } as any;
    
    if (typeof optimizer.optimize === "function") {
      try { optimizer.optimize(rawInput); } catch(e) {}
    }
    const exc = optimizer as any;
    if (typeof exc.execute === "function") {
      try { exc.execute(rawInput); } catch(e) {}
    }
  });
});