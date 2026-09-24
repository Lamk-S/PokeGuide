import { describe, it, expect } from "vitest";
import { SmogonCalculatorAdapter } from "../../../../../src/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import type { BattleScenario } from "../../../../../src/domain/battle/entities/BattleScenario";

describe("SmogonCalculatorAdapter", () => {
  const adapter = new SmogonCalculatorAdapter();

  const createValidScenario = (): BattleScenario => ({
    generation: 9,
    attacker: {
      id: 25,
      name: "pikachu",
      level: 50,
      nature: { name: "Serious" },
      evs: { hp: 0, attack: 0, defense: 0, "special-attack": 0, "special-defense": 0, speed: 0 },
      ivs: { hp: 31, attack: 31, defense: 31, "special-attack": 31, "special-defense": 31, speed: 31 }
    },
    defender: {
      id: 445,
      name: "garchomp",
      level: 50,
      nature: { name: "Serious" },
    },
    moveName: "tackle",
    conditions: {}
  } as any);

  it("calcula daño básico y maneja EVs indefinidos sin romperse", () => {
    const scenario = createValidScenario();
    // @ts-ignore: Forzamos estado inválido para probar la resiliencia del adapter
    scenario.attacker.evs = undefined;
    const result = adapter.calculate(scenario);
    expect(result.damage).toBeDefined();
    expect(result.damage.minDamage).toBeGreaterThanOrEqual(0);
  });

  it("lanza un error claro si la forma no está disponible en la generación", () => {
    const scenario = createValidScenario();
    scenario.attacker.name = "missingno-inventado";
    scenario.generation = 1;
    expect(() => adapter.calculate(scenario)).toThrowError(/no está disponible/i);
  });

  it("maneja correctamente ataques inmunes (0 daño) sin crashear la calculadora", () => {
    const scenario = createValidScenario();
    scenario.moveName = "thunderbolt";
    const result = adapter.calculate(scenario);
    expect(result.damage.maxDamage).toBe(0);
    expect(result.koAnalysis.probability).toBe(0);
    expect(result.explanation.summary).toContain("no hace daño");
  });

  it("utiliza el fallback interno para formas custom de Gen 9", () => {
    const scenario = createValidScenario();
    scenario.attacker.name = "absol-mega-z";
    const result = adapter.calculate(scenario);
    expect(result.damage).toBeDefined();
  });

  it("registra modificadores solo cuando afectan el daño real (clima, terreno y críticos)", () => {
    // Escenario 1: Lluvia potencia ataques de tipo Agua (Surf)
    const scenarioRain = createValidScenario();
    scenarioRain.defender.name = "charmander"; 
    scenarioRain.conditions = { weather: "Rain", isCriticalHit: true };
    scenarioRain.moveName = "surf"; 
    const resultRain = adapter.calculate(scenarioRain);
    
    const modsRain = resultRain.explanation.activeModifiers;
    expect(modsRain.some(m => m.includes("Clima"))).toBe(true);
    expect(modsRain.some(m => m.includes("Crítico"))).toBe(true);

    // Escenario 2: Campo Eléctrico potencia ataques de tipo Eléctrico (Thunderbolt)
    const scenarioTerrain = createValidScenario();
    scenarioTerrain.defender.name = "squirtle";
    scenarioTerrain.conditions = { terrain: "Electric" };
    scenarioTerrain.moveName = "thunderbolt"; 
    const resultTerrain = adapter.calculate(scenarioTerrain);
    
    const modsTerrain = resultTerrain.explanation.activeModifiers;
    expect(modsTerrain.some(m => m.includes("Campo"))).toBe(true);
  });
});