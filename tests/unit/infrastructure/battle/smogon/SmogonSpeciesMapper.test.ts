import { describe, it, expect } from "vitest";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import type { IResolvedParticipant, IResolvedBattleScenario, StatSet } from "@/domain/battle/types/BattleParticipant";
import type { Nature } from "@/domain/stats/types/StatTypes";

const seriousNature: Nature = { 
  name: "Serious", 
  nameEs: "Seria", 
  increasedStat: null, 
  decreasedStat: null 
};

function createStatSet(value: number): StatSet {
  return {
    hp: value,
    attack: value,
    defense: value,
    "special-attack": value,
    "special-defense": value,
    speed: value,
  };
}

function makeParticipant(id: number, name: string): IResolvedParticipant {
  return {
    id,
    name,
    level: 50,
    nature: seriousNature,
    evs: createStatSet(0),
    ivs: createStatSet(31),
    baseStats: createStatSet(100),
  };
}

describe("SmogonSpeciesMapper", () => {
  it("should resolve base attacker/defender scenario", () => {
    const attacker = makeParticipant(3, "venusaur");
    const defender = makeParticipant(445, "garchomp");

    const scenario: IResolvedBattleScenario = {
      generation: 9,
      attacker,
      defender,
      moveName: "Enfado",
      moveId: "outrage",
      conditions: { weather: "none", terrain: "none" },
    };

    const atkResolved = SmogonSpeciesMapper.resolve({ id: scenario.attacker.id, name: scenario.attacker.name }, scenario.generation);
    const defResolved = SmogonSpeciesMapper.resolve({ id: scenario.defender.id, name: scenario.defender.name }, scenario.generation);

    expect(atkResolved).toBeDefined();
    expect(defResolved).toBeDefined();
  });

  it("should resolve pikachu base", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 9,
      attacker: makeParticipant(25, "pikachu"),
      defender: makeParticipant(3, "venusaur"),
      moveName: "Rayo",
      moveId: "thunderbolt",
      conditions: { weather: "none", terrain: "none" },
    };

    const result = SmogonSpeciesMapper.resolve({ id: scenario.attacker.id, name: scenario.attacker.name }, scenario.generation);
    expect(result).toBeDefined();
    expect(result.supported).toBeTruthy();
  });

  it("should handle form fallback for gen 9", () => {
    const attacker = makeParticipant(3, "venusaur");
    const defender = makeParticipant(445, "garchomp");

    const atk = SmogonSpeciesMapper.resolve({ id: attacker.id, name: attacker.name }, 9);
    const def = SmogonSpeciesMapper.resolve({ id: defender.id, name: defender.name }, 9);

    expect(atk).toBeDefined();
    expect(def).toBeDefined();
    expect(atk.supported).toBeTruthy();
    expect(def.supported).toBeTruthy();
  });

  it("should map garchomp correctly", () => {
    const p = makeParticipant(445, "garchomp");
    const mapped = SmogonSpeciesMapper.resolve({ id: p.id, name: p.name }, 9);
    expect(mapped).toBeDefined();
    expect(mapped.supported).toBeTruthy();
  });

  it("should map venusaur correctly", () => {
    const p = makeParticipant(3, "venusaur");
    const mapped = SmogonSpeciesMapper.resolve({ id: p.id, name: p.name }, 9);
    expect(mapped).toBeDefined();
    expect(mapped.supported).toBeTruthy();
  });
});