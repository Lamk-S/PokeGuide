import { describe, it, expect } from "vitest";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import type { IResolvedParticipant, IResolvedBattleScenario, StatSet } from "@/domain/battle/types/BattleParticipant";
import type { Nature } from "@/domain/stats/types/StatTypes";

const seriousNature: Nature = { name: "Serious", nameEs: "Seria", increasedStat: null, decreasedStat: null };

function createStatSet(value: number): StatSet {
  return { hp: value, attack: value, defense: value, "special-attack": value, "special-defense": value, speed: value };
}

function makeParticipant(id: number, name: string): IResolvedParticipant {
  return { id, name, level: 50, nature: seriousNature, evs: createStatSet(0), ivs: createStatSet(31), baseStats: createStatSet(100) };
}

describe("SmogonSpeciesMapper", () => {
  it("should resolve base attacker/defender scenario", () => {
    const attacker = makeParticipant(3, "venusaur");
    const defender = makeParticipant(445, "garchomp");
    const scenario: IResolvedBattleScenario = {
      generation: 9, attacker, defender, moveName: "Enfado", moveId: "outrage", conditions: { weather: "none", terrain: "none" },
    };
    const atkId = parsePokemonIdentity(scenario.attacker.id, scenario.attacker.name);
    const defId = parsePokemonIdentity(scenario.defender.id, scenario.defender.name);
    const atkResolved = SmogonSpeciesMapper.resolve(atkId, scenario.generation);
    const defResolved = SmogonSpeciesMapper.resolve(defId, scenario.generation);
    expect(atkResolved).toBeDefined();
    expect(defResolved).toBeDefined();
  });

  it("should resolve pikachu base", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 9, attacker: makeParticipant(25, "pikachu"), defender: makeParticipant(3, "venusaur"),
      moveName: "Rayo", moveId: "thunderbolt", conditions: { weather: "none", terrain: "none" },
    };
    const atkId = parsePokemonIdentity(scenario.attacker.id, scenario.attacker.name);
    const result = SmogonSpeciesMapper.resolve(atkId, scenario.generation);
    expect(result).toBeDefined();
    expect(result.supported).toBeTruthy();
  });

  it("should handle form fallback for gen 9", () => {
    const attacker = makeParticipant(3, "venusaur");
    const defender = makeParticipant(445, "garchomp");
    const atkId = parsePokemonIdentity(attacker.id, attacker.name);
    const defId = parsePokemonIdentity(defender.id, defender.name);
    const atk = SmogonSpeciesMapper.resolve(atkId, 9);
    const def = SmogonSpeciesMapper.resolve(defId, 9);
    expect(atk).toBeDefined();
    expect(def).toBeDefined();
    expect(atk.supported).toBeTruthy();
    expect(def.supported).toBeTruthy();
  });

  it("should map garchomp correctly", () => {
    const p = makeParticipant(445, "garchomp");
    const id = parsePokemonIdentity(p.id, p.name);
    const mapped = SmogonSpeciesMapper.resolve(id, 9);
    expect(mapped).toBeDefined();
    expect(mapped.supported).toBeTruthy();
  });

  it("should map venusaur correctly", () => {
    const p = makeParticipant(3, "venusaur");
    const id = parsePokemonIdentity(p.id, p.name);
    const mapped = SmogonSpeciesMapper.resolve(id, 9);
    expect(mapped).toBeDefined();
    expect(mapped.supported).toBeTruthy();
  });
});
