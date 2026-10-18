import { describe, it, expect } from "vitest";
import { SpeedOptimizer } from "@/domain/optimization/services/SpeedOptimizer";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { NATURES } from "@/domain/stats/constants/natures";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";

describe("SpeedOptimizer (Binary Search)", () => {
  it("encuentra 244 EVs como el mínimo para alcanzar 168 de Speed en Garchomp Nivel 50", () => {
    const jolly = NATURES.find((n) => n.name === "Jolly")!;
    const problem = new OptimizationProblem(
      { type: "ev_investment", direction: "minimize" },
      [{ variable: "speed", operator: "gte", target: 168 }],
      {
        baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 } as Record<StatName, number>,
        ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 } as Record<StatName, number>,
        level: 50,
        nature: jolly as never,
        generation: 9,
        currentEVs: {},
      }
    );

    const result = SpeedOptimizer.optimize(problem);

    expect(result.status).toBe("Optimal");
    expect(result.solution).toBe(244);
    expect(result.achievedStat).toBe(168);

    expect(result.explanation?.evidence[0]).toContain("240 EV → 167 Speed — no alcanza");
    expect(result.explanation?.evidence[1]).toContain("244 EV → 168 Speed — cumple");
  });
});