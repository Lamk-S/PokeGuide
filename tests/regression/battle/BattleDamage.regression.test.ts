import { describe, it, expect, vi } from "vitest";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import type { IPokemonBaseProvider, IPokemonBaseData, StatSet, IResolvedBattleScenario, BattleResult, IBattleParticipantInput } from "@/domain/battle/types/BattleParticipant";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";

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

const mockBaseData = new Map<number, IPokemonBaseData>([
  [445, { id:445, name:"Garchomp", baseStats:createStatSet(108,130,95,80,85,102) }],
  [700, { id:700, name:"Sylveon", baseStats:createStatSet(95,65,65,110,130,60) }],
  [94, { id:94, name:"Gengar", baseStats:createStatSet(60,65,60,130,75,110) }],
  [65, { id:65, name:"Alakazam", baseStats:createStatSet(55,50,45,135,95,120) }],
]);

const mockPokemonRepo: IPokemonBaseProvider = {
  getBaseDataById: vi.fn(async (id: number) => mockBaseData.get(id)?? null),
};

const mockBattleCalculator: BattleCalculator = {
  calculate: vi.fn((scenario: IResolvedBattleScenario): BattleResult => ({
    damage:{minDamage:75,maxDamage:89,minPercent:41.2,maxPercent:48.9},
    koAnalysis:{guaranteed:false,hitsToKO:3,probability:0},
    explanation:{summary:"mock",activeModifiers:[]},
    defenderMaxHp:200,isOHKO:false,effectiveness:1,
    moveCategoryUsed: scenario.generation===3 && scenario.moveName==="Shadow Ball" ? "Physical":"Special",
  })),
};

const jolly: Nature = { name:"Jolly", nameEs:"Alegre", increasedStat:"speed", decreasedStat:"special-attack" };
const bold: Nature = { name:"Bold", nameEs:"Osada", increasedStat:"defense", decreasedStat:"attack" };
const timid: Nature = { name:"Timid", nameEs:"Miedosa", increasedStat:"speed", decreasedStat:"attack" };

describe("Regresión: Battle Damage", () => {
  it("mantiene cálculo exacto Gen 9", async () => {
    const useCase = new CalculateBattleScenarioUseCase(mockPokemonRepo, mockBattleCalculator);
    const attacker: IBattleParticipantInput = { pokemonId:445, level:50, nature:jolly, ivs:createStatSet(31,31,31,0,31,31), evs:createStatSet(0,252,0,0,4,252) };
    const defender: IBattleParticipantInput = { pokemonId:700, level:50, nature:bold, ivs:createStatSet(31,0,31,31,31,31), evs:createStatSet(252,0,252,0,4,0) };
    const result = await useCase.execute(9, attacker, defender, "Earthquake");
    expect(result.damage.minDamage).toBe(75);
  });
  it("respeta split Gen3 vs Gen9", async () => {
    const useCase = new CalculateBattleScenarioUseCase(mockPokemonRepo, mockBattleCalculator);
    const attacker: IBattleParticipantInput = { pokemonId:94, level:50, nature:timid, ivs:createStatSet(31,31,31,31,31,31), evs:createStatSet(0,0,0,252,0,252) };
    const defender: IBattleParticipantInput = { pokemonId:65, level:50, nature:timid, ivs:createStatSet(31,31,31,31,31,31), evs:createStatSet(0,0,0,0,0,0) };
    const r3 = await useCase.execute(3, attacker, defender, "Shadow Ball");
    const r9 = await useCase.execute(9, attacker, defender, "Shadow Ball");
    expect(r3.moveCategoryUsed).toBe("Physical");
    expect(r9.moveCategoryUsed).toBe("Special");
  });
});