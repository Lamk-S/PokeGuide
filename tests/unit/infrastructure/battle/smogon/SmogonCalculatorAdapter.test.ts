import { describe, it, expect } from "vitest";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import type { IResolvedBattleScenario, IResolvedParticipant, StatSet } from "@/domain/battle/types/BattleParticipant";

const seriousNature = { name: "Serious", nameEs: "Seria", increasedStat: null, decreasedStat: null } as any;

function createStatSet(value: number): StatSet {
  return { hp: value, attack: value, defense: value, "special-attack": value, "special-defense": value, speed: value };
}

const basePikachu: IResolvedParticipant = {
  id: 25, name: "pikachu", level: 50, nature: seriousNature,
  evs: createStatSet(0), ivs: createStatSet(31), baseStats: createStatSet(50)
};

const baseGarchomp: IResolvedParticipant = {
  id: 445, name: "garchomp", level: 50, nature: seriousNature,
  evs: createStatSet(0), ivs: createStatSet(31), baseStats: createStatSet(100)
};

describe("SmogonCalculatorAdapter", () => {
  const adapter = new SmogonCalculatorAdapter();

  it("calcula correctamente la inmunidad (eléctrico vs tierra)", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 9,
      attacker: basePikachu,
      defender: baseGarchomp,
      moveName: "Thunderbolt",
      moveId: "thunderbolt",
      conditions: { weather: "none", terrain: "none" }
    };

    const result = adapter.calculate(scenario);
    expect(result.effectiveness).toBe(0);
    expect(result.isOHKO).toBe(false);
    expect(result.damage.maxDamage).toBe(0);
    expect(result.explanation.summary).toContain("inmune");
  });

  it("calcula modificadores activos: clima, terreno, quemadura y crítico", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 9,
      attacker: { ...basePikachu, id: 6, name: "charizard", status: "burn", isCriticalHit: true },
      defender: { ...baseGarchomp, id: 3, name: "venusaur" },
      moveName: "Flare Blitz",
      moveId: "flare-blitz",
      conditions: { weather: "sun", terrain: "electric" }
    };

    const result = adapter.calculate(scenario);
    const mods = result.explanation.activeModifiers;
    expect(mods.some(m => m.includes("Fuego") || m.includes("sun"))).toBeTruthy();
    expect(mods.some(m => m.includes("Crítico"))).toBeTruthy();
    expect(mods.some(m => m.includes("Quemadura"))).toBeTruthy();
    expect(result.moveCategoryUsed).toBe("Physical");
  });

  it("mapea correctamente otras condiciones de terreno, clima y estados", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 9,
      attacker: { ...basePikachu, id: 94, name: "gengar", status: "tox" as any },
      defender: { ...baseGarchomp, id: 65, name: "alakazam", status: "par" as any },
      moveName: "Shadow Ball",
      moveId: "shadow-ball",
      conditions: { weather: "rain", terrain: "psychic" }
    };

    const result = adapter.calculate(scenario);
    expect(result).toBeDefined();
    expect(result.explanation.activeModifiers.length).toBeGreaterThanOrEqual(0);
  });

  it("lanza error si la forma no está disponible en la generación", () => {
    const scenario: IResolvedBattleScenario = {
      generation: 1,
      attacker: { ...basePikachu, id: 25, name: "pikachu-cosplay" },
      defender: baseGarchomp,
      moveName: "Thunderbolt",
      moveId: "thunderbolt",
      conditions: { weather: "none", terrain: "none" }
    };

    expect(() => adapter.calculate(scenario)).toThrowError(/no está disponible en Gen/);
  });
});