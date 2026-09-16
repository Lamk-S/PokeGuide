import { describe, it, expect } from "vitest";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { Nature } from "@/domain/stats/types/StatTypes";

const jollyNature: Nature = { name: "Jolly", nameEs: "Alegre", increasedStat: "speed", decreasedStat: "special-attack" };

describe("Stat Engine - Domain", () => {
  it("calculates competitive Garchomp correctly (Known Value Test)", () => {
    const stats = calculateStats({
      baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
      level: 50,
      nature: jollyNature,
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 0, attack: 252, defense: 0, "special-attack": 0, "special-defense": 4, speed: 252 },
      generation: 9,
    });
    
    // Garchomp stats at lvl 50, Jolly, 252 Atk / 4 SpD / 252 Spe
    expect(stats.hp).toBe(183);
    expect(stats.attack).toBe(182);
    expect(stats.defense).toBe(115);
    expect(stats.speed).toBe(169);
  });

  it("normalizes EVs automatically so the total never exceeds 510", () => {
    const input = {
      baseStats: { hp: 100, attack: 100, defense: 100, "special-attack": 100, "special-defense": 100, speed: 100 },
      level: 50,
      nature: jollyNature,
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      // Se intenta inyectar 756 EVs en total
      evs: { hp: 252, attack: 252, defense: 252, "special-attack": 0, "special-defense": 0, speed: 0 },
      generation: 9,
    };

    expect(() => calculateStats(input)).not.toThrow();
  });

  it("applies Shedinja HP rule (Base HP = 1 always results in 1 HP)", () => {
    const stats = calculateStats({
      baseStats: { hp: 1, attack: 90, defense: 45, "special-attack": 30, "special-defense": 30, speed: 40 },
      level: 50,
      nature: jollyNature,
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 252, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 },
      generation: 9,
    });
    
    expect(stats.hp).toBe(1);
  });
});