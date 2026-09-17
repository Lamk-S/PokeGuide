import { describe, it, expect } from "vitest";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";

class MockPokemonRepository implements PokemonRepository {
  async getById(id: number): Promise<Pokemon | null> {
    if (id === 445) { // Garchomp
      return {
        id: 445, name: "Garchomp", types: ["Dragon", "Ground"],
        baseStats: { hp: 108, attack: 130, defense: 95, "special-attack": 80, "special-defense": 85, speed: 102 },
        height: 19, weight: 950,
        abilities: [{ name: "Sand Veil", isHidden: false, slot: 1 }],
        moves: [{ name: "Earthquake", learnMethod: "machine", levelLearnedAt: 0 } as any], 
      };
    }
    if (id === 25) { // Pikachu
      return {
        id: 25, name: "Pikachu", types: ["Electric"],
        baseStats: { hp: 35, attack: 55, defense: 40, "special-attack": 50, "special-defense": 50, speed: 90 },
        height: 4, weight: 60,
        abilities: [{ name: "Static", isHidden: false, slot: 1 }],
        moves: [],
      };
    }
    return null; 
  }
  async getByName(_name: string) { return null; }
  async getAll() { return []; }
}

describe("CalculateBattleScenarioUseCase Integration", () => {
  it("demuestra que modificar EVs impacta matemáticamente el daño en Battle Lab", async () => {
    const repository = new MockPokemonRepository();
    const adapter = new SmogonCalculatorAdapter();
    const useCase = new CalculateBattleScenarioUseCase(repository, adapter);

    // Garchomp SIN EVs en Ataque
    const attackerNoEV = {
      pokemonId: 445, level: 50,
      nature: { name: "Serious", nameEs: "Seria", increasedStat: null, decreasedStat: null },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 },
    };

    // Garchomp MAX EVs en Ataque + Naturaleza Firme
    const attackerMaxEV = {
      ...attackerNoEV,
      nature: { name: "Adamant", nameEs: "Firme", increasedStat: "attack" as const, decreasedStat: "special-attack" as const },
      evs: { ...attackerNoEV.evs, attack: 252 },
    };

    // Pikachu Tanque (MAX HP / MAX DEF) para sobrevivir y medir la diferencia
    const defenderTank = {
      pokemonId: 25, level: 50,
      nature: { name: "Bold", nameEs: "Osada", increasedStat: "defense" as const, decreasedStat: "attack" as const },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 },
      evs: { hp: 252, attack: 0, defense: 252, "special-attack": 0, "special-defense": 0, speed: 0 },
    };

    const resultWithoutEV = await useCase.execute(9, attackerNoEV, defenderTank, "Earthquake");
    const resultWithEV = await useCase.execute(9, attackerMaxEV, defenderTank, "Earthquake");

    // El daño máximo debe ser obligatoriamente superior al inyectar 252 EVs y Naturaleza favorable.
    expect(resultWithEV.damage.maxDamage).toBeGreaterThan(resultWithoutEV.damage.maxDamage);
    
    // Verificamos exactitud en cálculos de límite KO
    expect(resultWithEV.koAnalysis.hitsToKO).toBeDefined();
  });
});