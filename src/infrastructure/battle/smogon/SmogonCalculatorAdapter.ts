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

function toSmogonStats(input?: Record<StatName, number>) {
  if (!input) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  return Object.entries(input).reduce(
    (acc, [k, v]) => {
      const key = STAT_TO_SMOGON[k as StatName];
      if (key) acc[key] = Math.max(0, v ?? 0);
      return acc;
    },
    {} as Record<string, number>,
  );
}

export class SmogonCalculatorAdapter implements BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult {
    const attacker = new Pokemon(
      scenario.generation as GenerationNum,
      scenario.attacker.name,
      {
        level: scenario.attacker.level,
        nature: scenario.attacker.nature.name,
        evs: toSmogonStats(scenario.attacker.evs),
        ivs: toSmogonStats(scenario.attacker.ivs),
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
        evs: toSmogonStats(scenario.defender.evs),
        ivs: toSmogonStats(scenario.defender.ivs),
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

    const factors: BattleExplanationFactor[] = [];
    if (scenario.attacker.item)
      factors.push({
        label: "Objeto Atacante",
        description: scenario.attacker.item,
        multiplier: 1.3,
      });
    if (scenario.defender.item)
      factors.push({
        label: "Objeto Defensor",
        description: scenario.defender.item,
        multiplier: 1,
      });
    if (scenario.conditions.weather)
      factors.push({
        label: "Clima",
        description: scenario.conditions.weather,
        multiplier: 1.5,
      });
    if (scenario.conditions.terrain)
      factors.push({
        label: "Terreno",
        description: scenario.conditions.terrain,
        multiplier: 1.3,
      });
    if (scenario.conditions.isCriticalHit)
      factors.push({
        label: "Crítico",
        description: "Golpe crítico",
        multiplier: 1.5,
      });

    return {
      defenderMaxHp: defenderHp,
      damage: { minDamage, maxDamage, minPercent, maxPercent, damageRolls },
      koAnalysis: {
        hitsToKO:
          maxDamage >= defenderHp
            ? 1
            : Math.ceil(defenderHp / (maxDamage || 1)),
        guaranteed: minDamage >= defenderHp,
        probability,
      },
      explanation: { summary: result.desc(), factors },
    };
  }
}
