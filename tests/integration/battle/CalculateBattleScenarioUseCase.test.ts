import { describe, it, expect } from "vitest";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import type { IPokemonBaseProvider, StatSet } from "@/domain/battle/types/BattleParticipant";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

function createStatSet(hp: number, attack: number, defense: number, specialAttack: number, specialDefense: number, speed: number): StatSet {
  return {
    hp,
    attack,
    defense,
    "special-attack": specialAttack,
    "special-defense": specialDefense,
    speed,
  };
}

const bold: Nature = { name: "Bold", nameEs: "Osada", increasedStat: "defense", decreasedStat: "attack" };
const timid: Nature = { name: "Timid", nameEs: "Miedosa", increasedStat: "speed", decreasedStat: "attack" };

describe("CalculateBattleScenarioUseCase - integration", () => {
  it("calcula con repos reales", async () => {
    const repo = new LocalPokemonRepository();
    const provider: IPokemonBaseProvider = new PokemonBaseProviderAdapter(repo);
    const calc = new SmogonCalculatorAdapter();
    const useCase = new CalculateBattleScenarioUseCase(provider, calc);

    const attacker = { pokemonId: 25, level: 50, nature: timid, ivs: createStatSet(31,31,31,31,31,31), evs: createStatSet(0,0,0,252,0,252) };
    const defender = { pokemonId: 445, level: 50, nature: bold, ivs: createStatSet(31,31,31,31,31,31), evs: createStatSet(252,0,252,0,4,0) };

    const result = await useCase.execute(9, attacker, defender, "Thunderbolt");
    expect(result.damage).toBeDefined();
  });
});