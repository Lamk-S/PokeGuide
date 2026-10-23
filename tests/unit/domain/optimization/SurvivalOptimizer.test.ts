import { describe, it, expect } from "vitest";
import { SurvivalOptimizer, optimizeSurvival } from "@/domain/optimization/services/SurvivalOptimizer";

describe("SurvivalOptimizer", () => {
  const baseStats = { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 };
  const nature = { name: "Serious", increasedStat: null, decreasedStat: null };
  const ivs = { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 };
  const evs = { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 };
  
  it("calcula la optimización de supervivencia óptima y maneja Infeasible", () => {
    const input = { baseStats, level: 50, nature, ivs, evs, generation: 9, defenseStat: "defense" as const };
    const result = optimizeSurvival(input, (hp, def) => hp + def >= 100, "defense");
    expect(result.status).toBe("Optimal");
    expect(result.solution?.hp).toBeDefined();

    const failed = optimizeSurvival(input, () => false, "defense");
    expect(failed.status).toBe("Infeasible");

    const edge = optimizeSurvival(input, (hp, def) => hp === 252 && def === 252, "defense");
    expect(edge.status).toBe("Optimal");
  });

  it("extrae el problema desde OptimizationProblem y usa special-defense", () => {
    const mockProblem = {
      context: { baseStats, ivs, level: 50, nature, generation: 9, currentEVs: evs }
    } as any;

    const res1 = SurvivalOptimizer.optimize(mockProblem, (hp, def) => hp >= 0, "special-defense");
    expect(res1.status).toBe("Optimal");
    expect(res1.solution?.specialDefense).toBeDefined();

    const res2 = optimizeSurvival(mockProblem);
    expect(res2.status).toBe("Optimal");
  });

  it("ejecuta correctamente desde la instancia de la clase", () => {
    const optimizer = new SurvivalOptimizer();
    const input = { baseStats, level: 50, nature, ivs, evs, generation: 9, defenseStat: "defense" as const };
    const result = optimizer.optimize(input, () => true, "defense");
    expect(result.status).toBe("Optimal");
  });
});