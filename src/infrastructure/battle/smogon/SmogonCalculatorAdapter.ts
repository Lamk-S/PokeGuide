import {
  calculate,
  Pokemon,
  Move,
  Field,
  type GenerationNum,
} from "@smogon/calc";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import type {
  BattleExplanationFactor,
  BattleResult,
} from "@/domain/battle/types/BattleTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";

type SmogonWeather = "Sand" | "Sun" | "Rain" | "Hail" | "Snow";
type SmogonTerrain = "Electric" | "Grassy" | "Psychic" | "Misty";

const STAT_TO_SMOGON: Record<StatName, string> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spa",
  "special-defense": "spd",
  speed: "spe",
};

function toSmogonStats(input: Record<StatName, number>) {
  return Object.entries(input).reduce(
    (acc, [k, v]) => {
      const key = STAT_TO_SMOGON[k as StatName];
      if (key) acc[key] = v;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export class SmogonCalculatorAdapter implements BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult {
    // Atacante - sin undefined
    const attacker = new Pokemon(
      scenario.generation as GenerationNum,
      scenario.attacker.name,
      {
        level: scenario.attacker.level,
        nature: scenario.attacker.nature.name,
        evs: toSmogonStats(scenario.attacker.evs as Record<StatName, number>),
        ivs: toSmogonStats(scenario.attacker.ivs as Record<StatName, number>),
        ...(scenario.attacker.ability
          ? { ability: scenario.attacker.ability }
          : {}),
        ...(scenario.attacker.item ? { item: scenario.attacker.item } : {}),
      },
    );

    const defender = new Pokemon(
      scenario.generation as GenerationNum,
      scenario.defender.name,
      {
        level: scenario.defender.level,
        nature: scenario.defender.nature.name,
        evs: toSmogonStats(scenario.defender.evs as Record<StatName, number>),
        ivs: toSmogonStats(scenario.defender.ivs as Record<StatName, number>),
        ...(scenario.defender.ability
          ? { ability: scenario.defender.ability }
          : {}),
        ...(scenario.defender.item ? { item: scenario.defender.item } : {}),
      },
    );

    const move = new Move(
      scenario.generation as GenerationNum,
      scenario.moveName,
      {
        ...(scenario.conditions.isCriticalHit !== undefined
          ? { isCrit: scenario.conditions.isCriticalHit }
          : {}),
      },
    );

    const field = new Field({
      ...(scenario.conditions.weather
        ? { weather: scenario.conditions.weather as SmogonWeather }
        : {}),
      ...(scenario.conditions.terrain
        ? { terrain: scenario.conditions.terrain as SmogonTerrain }
        : {}),
    });

    const result = calculate(
      scenario.generation as GenerationNum,
      attacker,
      defender,
      move,
      field,
    );

    const range = result.range();
    const defenderHp = defender.stats.hp || 1;
    const damageRolls = Array.isArray(result.damage)
      ? (result.damage as number[])
      : typeof result.damage === "number"
        ? [result.damage]
        : [0];

    const minDamage = range[0] ?? 0;
    const maxDamage = range[1] ?? 0;
    const minPercent = Number(((minDamage / defenderHp) * 100).toFixed(1));
    const maxPercent = Number(((maxDamage / defenderHp) * 100).toFixed(1));

    const koRolls = damageRolls.filter((d) => d >= defenderHp).length;
    const probability = damageRolls.length
      ? Math.round((koRolls / damageRolls.length) * 100)
      : 0;
    const guaranteed = minDamage >= defenderHp;
    const hitsToKO =
      maxDamage === 0
        ? 0
        : maxDamage >= defenderHp
          ? 1
          : Math.ceil(defenderHp / maxDamage);

    const factors: BattleExplanationFactor[] = [];
    if (scenario.attacker.item)
      factors.push({
        label: "Objeto Atacante",
        description: `Equipado con ${scenario.attacker.item}`,
      });
    if (scenario.defender.item)
      factors.push({
        label: "Objeto Defensor",
        description: `Equipado con ${scenario.defender.item}`,
      });
    if (scenario.conditions.weather)
      factors.push({
        label: "Clima",
        description: `Clima: ${scenario.conditions.weather}`,
      });
    if (scenario.conditions.terrain)
      factors.push({
        label: "Terreno",
        description: `Terreno: ${scenario.conditions.terrain}`,
      });
    if (scenario.conditions.isCriticalHit)
      factors.push({ label: "Crítico", description: "Golpe crítico aplicado" });

    return {
      damage: { minDamage, maxDamage, minPercent, maxPercent, damageRolls },
      koAnalysis: { hitsToKO, guaranteed, probability },
      explanation: { summary: result.desc(), factors },
    };
  }
}
