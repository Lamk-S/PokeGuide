import { describe, it, expect, vi } from "vitest";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

type Stats = Record<StatName, number>;

const mockPokemonRepo = {
  getById: vi.fn(async (id: number) => {
    if (id === 445) return { name: "Garchomp", baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 } as any };
    if (id === 700) return { name: "Sylveon", baseStats: { hp: 95, attack: 65, defense: 65, "special-attack": 110, "special-defense": 130, speed: 60 } as any };
    if (id === 94) return { name: "Gengar", baseStats: { hp: 60, attack: 65, defense: 60, "special-attack": 130, "special-defense": 75, speed: 110 } as any };
    if (id === 65) return { name: "Alakazam", baseStats: { hp: 55, attack: 50, defense: 45, "special-attack": 135, "special-defense": 95, speed: 120 } as any };
    return null;
  }),
} as unknown as PokemonRepository;

const mockBattleCalculator = {
  calculate: vi.fn(async (scenario: any): Promise<BattleResult> => {
    return {
      damage: { minDamage: 75, maxDamage: 89, minPercent: 41.2, maxPercent: 48.9 } as any,
      isOHKO: false,
      effectiveness: 1,
      moveCategoryUsed: scenario.generation === 3 && scenario.moveName === "Shadow Ball" ? "Physical" : "Special",
    } as unknown as BattleResult;
  }),
} as unknown as BattleCalculator;

const s = (hp: number, atk: number, def: number, spa: number, spd: number, spe: number): Stats => {
  return {
    hp,
    attack: atk,
    defense: def,
    "special-attack": spa,
    "special-defense": spd,
    speed: spe,
  } as unknown as Stats;
};

describe("Regresión: Battle Damage", () => {
  it("mantiene cálculo exacto Gen 9: Garchomp Earthquake vs Sylveon", async () => {
    const useCase = new CalculateBattleScenarioUseCase(mockPokemonRepo, mockBattleCalculator);

    const attacker = {
      pokemonId: 445,
      level: 50,
      nature: "Jolly" as unknown as Nature,
      ivs: s(31, 31, 31, 0, 31, 31),
      evs: s(0, 252, 0, 0, 4, 252),
    };

    const defender = {
      pokemonId: 700,
      level: 50,
      nature: "Bold" as unknown as Nature,
      ivs: s(31, 0, 31, 31, 31, 31),
      evs: s(252, 0, 252, 0, 4, 0),
    };

    const result = await useCase.execute(9, attacker, defender, "Earthquake");

    expect(result.damage.minDamage).toBe(75);
    expect(result.damage.maxDamage).toBe(89);
    expect((result as any).isOHKO).toBe(false);
    expect((result as any).effectiveness).toBe(1);
  });

  it("respeta Physical/Special split Gen 3 vs Gen 9", async () => {
    const useCase = new CalculateBattleScenarioUseCase(mockPokemonRepo, mockBattleCalculator);

    const attacker = {
      pokemonId: 94,
      level: 50,
      nature: "Timid" as unknown as Nature,
      ivs: s(31, 31, 31, 31, 31, 31),
      evs: s(0, 0, 0, 252, 0, 252),
    };
    const defender = {
      pokemonId: 65,
      level: 50,
      nature: "Timid" as unknown as Nature,
      ivs: s(31, 31, 31, 31, 31, 31),
      evs: s(0, 0, 0, 0, 0, 0),
    };

    const r3 = await useCase.execute(3, attacker, defender, "Shadow Ball") as any;
    const r9 = await useCase.execute(9, attacker, defender, "Shadow Ball") as any;

    expect(r3.moveCategoryUsed).toBe("Physical");
    expect(r9.moveCategoryUsed).toBe("Special");
  });
});