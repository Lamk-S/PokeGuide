import {
  calculate,
  Pokemon,
  Move,
  Field,
  type GenerationNum,
} from "@smogon/calc";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import { SmogonSpeciesMapper } from "./SmogonSpeciesMapper";

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

function toSmogonStats(
  input: Record<StatName, number> | undefined,
): Record<string, number> {
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
    const attackerResolution = SmogonSpeciesMapper.resolve(
      { id: scenario.attacker.id, name: scenario.attacker.name },
      scenario.generation,
    );
    const defenderResolution = SmogonSpeciesMapper.resolve(
      { id: scenario.defender.id, name: scenario.defender.name },
      scenario.generation,
    );

    if (!attackerResolution.supported) {
      throw new Error(
        `La forma "${scenario.attacker.name}" (ID ${scenario.attacker.id}) no está disponible en el motor de cálculo para Gen ${scenario.generation}. ${attackerResolution.reason ?? ""}`.trim(),
      );
    }
    if (!defenderResolution.supported) {
      throw new Error(
        `La forma "${scenario.defender.name}" (ID ${scenario.defender.id}) no está disponible en el motor de cálculo para Gen ${scenario.generation}. ${defenderResolution.reason ?? ""}`.trim(),
      );
    }

    const atkName = attackerResolution.smogonName;
    const defName = defenderResolution.smogonName;

    const gen = scenario.generation as GenerationNum;

    const attacker = new Pokemon(gen, atkName, {
      level: scenario.attacker.level,
      nature: scenario.attacker.nature.name,
      evs: toSmogonStats(scenario.attacker.evs),
      ivs: toSmogonStats(scenario.attacker.ivs),
      ...(scenario.attacker.ability
        ? { ability: scenario.attacker.ability }
        : {}),
      ...(scenario.attacker.item ? { item: scenario.attacker.item } : {}),
    });

    const defender = new Pokemon(gen, defName, {
      level: scenario.defender.level,
      nature: scenario.defender.nature.name,
      evs: toSmogonStats(scenario.defender.evs),
      ivs: toSmogonStats(scenario.defender.ivs),
      ...(scenario.defender.ability
        ? { ability: scenario.defender.ability }
        : {}),
      ...(scenario.defender.item ? { item: scenario.defender.item } : {}),
    });

    const defenderHp = defender.stats.hp;
    if (typeof defenderHp !== "number" || defenderHp <= 0) {
      throw new Error(
        `No se pudo resolver el defensor ${scenario.defender.id} (${scenario.defender.name}) mapeado como ${defName} en Gen ${gen}. HP inválido.`,
      );
    }
    const attackerStatsValid =
      attacker.stats.hp && attacker.stats.atk !== undefined;
    if (!attackerStatsValid) {
      throw new Error(
        `No se pudo resolver el atacante ${scenario.attacker.id} (${scenario.attacker.name}) mapeado como ${atkName} en Gen ${gen}.`,
      );
    }

    const move = new Move(gen, scenario.moveName, {
      ...(scenario.conditions.isCriticalHit !== undefined
        ? { isCrit: scenario.conditions.isCriticalHit }
        : {}),
    });

    const field = new Field({
      ...(scenario.conditions.weather
        ? { weather: scenario.conditions.weather as SmogonWeather }
        : {}),
      ...(scenario.conditions.terrain
        ? { terrain: scenario.conditions.terrain as SmogonTerrain }
        : {}),
    });

    const result = calculate(gen, attacker, defender, move, field);
    const range = result.range();

    const minDamage = range[0] ?? 0;
    const maxDamage = range[1] ?? 0;
    const minPercent = Number(((minDamage / defenderHp) * 100).toFixed(1));
    const maxPercent = Number(((maxDamage / defenderHp) * 100).toFixed(1));

    const ko = result.kochance();
    let probability = 100;
    let guaranteed = true;
    const hitsToKO = ko.n;

    if (ko.chance !== undefined) {
      probability = Math.round(ko.chance * 1000) / 10;
      guaranteed = ko.chance === 1;
    } else if (ko.n === 0) {
      probability = 0;
      guaranteed = false;
    }

    const raw = result.rawDesc;
    const activeModifiers: string[] = [];
    const context: Array<{ label: string; value: string }> = [];

    if (result.desc().includes("STAB")) activeModifiers.push("STAB x1.5");
    if (scenario.conditions.isCriticalHit)
      activeModifiers.push("Golpe Crítico x1.5");
    if (raw.weather) activeModifiers.push(`Clima: ${raw.weather}`);
    if (raw.terrain) activeModifiers.push(`Campo: ${raw.terrain}`);
    if (raw.isBurned) activeModifiers.push("Quemadura Atacante x0.5");

    interface ExtendedRawDesc {
      isReflect?: boolean;
      isLightScreen?: boolean;
      isProtected?: boolean;
    }
    const rawExt = raw as typeof raw & ExtendedRawDesc;
    if (rawExt.isReflect) activeModifiers.push("Reflejo x0.5 Físico");
    if (rawExt.isLightScreen)
      activeModifiers.push("Pantalla Luz x0.5 Especial");
    if (rawExt.isProtected) activeModifiers.push("Protección");

    if (raw.attackerAbility) {
      context.push({
        label: `Habilidad de ${scenario.attacker.name}`,
        value: raw.attackerAbility,
      });
    }
    if (raw.defenderAbility) {
      context.push({
        label: `Habilidad de ${scenario.defender.name}`,
        value: raw.defenderAbility,
      });
    }
    if (raw.attackerItem) {
      context.push({
        label: `Objeto de ${scenario.attacker.name}`,
        value: raw.attackerItem,
      });
    }
    if (raw.defenderItem) {
      context.push({
        label: `Objeto de ${scenario.defender.name}`,
        value: raw.defenderItem,
      });
    }

    return {
      defenderMaxHp: defenderHp,
      damage: { minDamage, maxDamage, minPercent, maxPercent },
      koAnalysis: { hitsToKO, guaranteed, probability },
      explanation: { summary: result.desc(), activeModifiers, context },
    };
  }
}
