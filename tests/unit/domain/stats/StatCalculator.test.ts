import { describe, it, expect } from "vitest";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { StatCalculationInput, Nature } from "@/domain/stats/types/StatTypes";

describe("Stat Engine - Domain", () => {
  const jollyNature: Nature = { name: "Jolly", increasedStat: "speed", decreasedStat: "special-attack" };
  const garchompBaseStats = {
    hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102
  };

  it("calculates competitive Garchomp correctly (Known Value Test)", () => {
    const input: StatCalculationInput = {
      baseStats: garchompBaseStats,
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 0, attack: 252, defense: 0, "special-attack": 0, "special-defense": 4, speed: 252 },
      level: 50,
      nature: jollyNature,
      generation: 9
    };

    const result = calculateStats(input);

    expect(result.hp).toBe(183);
    expect(result.attack).toBe(182);
    expect(result.defense).toBe(115);
    expect(result["special-attack"]).toBe(90);
    expect(result["special-defense"]).toBe(106);
    expect(result.speed).toBe(169);
  });

  it("throws InvalidEVError if total EVs exceed 510", () => {
    const input: StatCalculationInput = {
      baseStats: garchompBaseStats,
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 252, attack: 252, defense: 252, "special-attack": 0, "special-defense": 0, speed: 0 },
      level: 50,
      nature: jollyNature,
      generation: 9
    };

    expect(() => calculateStats(input)).toThrow(/suma total de EVs/);
  });

  it("applies Shedinja HP rule (Base HP = 1 always results in 1 HP)", () => {
    const shedinjaInput: StatCalculationInput = {
      baseStats: { hp: 1, attack: 90, defense: 45, "special-attack": 30, "special-defense": 30, speed: 40 },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 252, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 },
      level: 100,
      nature: jollyNature,
      generation: 9
    };

    const result = calculateStats(shedinjaInput);
    expect(result.hp).toBe(1);
  });
});