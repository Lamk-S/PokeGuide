import { describe, it, expect, } from "vitest";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";

// Mock básico del PokemonRepository devolviendo datos simulados del JSON
class MockPokemonRepository implements PokemonRepository {
  async getById(id: number): Promise<Pokemon | null> {
    if (id === 445) { // Garchomp
      return {
        id: 445,
        name: "Garchomp",
        types: ["dragon", "ground"],
        baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
        height: 19,
        weight: 950,
      };
    }
    if (id === 25) { // Pikachu
      return {
        id: 25,
        name: "Pikachu",
        types: ["electric"],
        baseStats: { hp: 35, attack: 55, defense: 40, "special-attack": 50, "special-defense": 50, speed: 90 },
        height: 4,
        weight: 60,
      };
    }
    return null;
  }
  async getByName(): Promise<Pokemon | null> { return null; }
  async getAll(): Promise<Pokemon[]> { return []; }
}

describe("CalculateBattleScenarioUseCase Integration", () => {
  it("calculates damage correctly connecting Stat Engine and Smogon", async () => {
    const repository = new MockPokemonRepository();
    const adapter = new SmogonCalculatorAdapter();
    const useCase = new CalculateBattleScenarioUseCase(repository, adapter);

    const attackerInput = {
      pokemonId: 445, // Garchomp
      level: 50,
      nature: { name: "Jolly", increasedStat: "speed" as const, decreasedStat: "special-attack" as const },
      item: "Life Orb",
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 0, attack: 252, defense: 0, "special-attack": 0, "special-defense": 4, speed: 252 },
    };

    const defenderInput = {
      pokemonId: 25, // Pikachu
      level: 50,
      nature: { name: "Timid", increasedStat: "speed" as const, decreasedStat: "attack" as const },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 4, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 252 },
    };

    const result = await useCase.execute(9, attackerInput, defenderInput, "Earthquake");

    // Verificar estructura de respuesta y garantías
    expect(result.damage).toBeDefined();
    expect(result.damage.damageRolls.length).toBeGreaterThan(0);
    // Garchomp vs Pikachu con EQ es OHKO 100% garantizado
    expect(result.koAnalysis.guaranteed).toBe(true);
    expect(result.koAnalysis.hitsToKO).toBe(1);
    // Explainability generó el objeto Atacante
    expect(result.explanation.factors.some(f => f.label === "Objeto Atacante")).toBe(true);
  });
});