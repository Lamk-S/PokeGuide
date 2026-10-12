import { describe, it, expect } from "vitest";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";

describe("CalculateBattleScenarioUseCase", () => {
  it("calculates damage", async () => {
    const repo = new LocalPokemonRepository();
    await repo.init();
    
    const provider = new PokemonBaseProviderAdapter(repo as never);
    const calculator = new SmogonCalculatorAdapter();
    const useCase = new CalculateBattleScenarioUseCase(provider as never, calculator as never);

    const result = await useCase.execute(
      9,
      {
        pokemonId: 25,
        level: 50,
        nature: { name: "Timid", nameEs: "Miedosa", increasedStat: "speed", decreasedStat: "attack" } as never,
        evs: { hp: 0, attack: 0, defense: 0, "special-attack": 252, "special-defense": 4, speed: 252 } as never,
        ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 } as never,
      },
      {
        pokemonId: 6,
        level: 50,
        nature: { name: "Modest", nameEs: "Modesta", increasedStat: "special-attack", decreasedStat: "attack" } as never,
        evs: { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 } as never,
        ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 } as never,
      },
      "Thunderbolt",
      { weather: "none", terrain: "none" }
    );

    expect(result.damage.maxDamage).toBeGreaterThan(0);
  }, 15000);
});