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

    const shouldAllowFallback = (r: typeof attackerResolution) =>
      !r.supported && r.isFallbackToBase && r.baseStatsSource;

    if (
      !attackerResolution.supported &&
      !shouldAllowFallback(attackerResolution)
    ) {
      throw new Error(
        `La forma "${scenario.attacker.name}" (ID ${scenario.attacker.id}) no está disponible en el motor de cálculo para Gen ${scenario.generation}. ${attackerResolution.reason ?? ""}`.trim(),
      );
    }
    if (
      !defenderResolution.supported &&
      !shouldAllowFallback(defenderResolution)
    ) {
      throw new Error(
        `La forma "${scenario.defender.name}" (ID ${scenario.defender.id}) no está disponible en el motor de cálculo para Gen ${scenario.generation}. ${defenderResolution.reason ?? ""}`.trim(),
      );
    }

    const atkName = shouldAllowFallback(attackerResolution)
      ? (attackerResolution.baseStatsSource as string)
      : attackerResolution.smogonName;
    const defName = shouldAllowFallback(defenderResolution)
      ? (defenderResolution.baseStatsSource as string)
      : defenderResolution.smogonName;

    const gen = scenario.generation as GenerationNum;

    let attacker: InstanceType<typeof Pokemon>;
    let defender: InstanceType<typeof Pokemon>;
    try {
      const tryCreatePokemon = (
        name: string,
        input: typeof scenario.attacker,
        genNum: GenerationNum,
      ) => {
        try {
          return new Pokemon(genNum, name, {
            level: input.level,
            nature: input.nature.name,
            evs: toSmogonStats(input.evs),
            ivs: toSmogonStats(input.ivs),
            ...(input.ability ? { ability: input.ability } : {}),
            ...(input.item ? { item: input.item } : {}),
          });
        } catch (e) {
          if (genNum === 9) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { SmogonSpeciesMapper } = require("./SmogonSpeciesMapper");
            const fallback = SmogonSpeciesMapper.getFallbackForGen9(name);
            if (fallback) {
              try {
                return new Pokemon(genNum, fallback, {
                  level: input.level,
                  nature: input.nature.name,
                  evs: toSmogonStats(input.evs),
                  ivs: toSmogonStats(input.ivs),
                  ...(input.ability ? { ability: input.ability } : {}),
                  ...(input.item ? { item: input.item } : {}),
                });
              } catch (_e2) {
                throw e;
              }
            }
          }
          throw e;
        }
      };

      attacker = tryCreatePokemon(atkName, scenario.attacker, gen);
      defender = tryCreatePokemon(defName, scenario.defender, gen);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Error creando Pokémon en Smogon: ${message}. Atacante=${atkName} Defensor=${defName} Gen=${gen}`,
      );
    }

    if (!defender?.stats) {
      throw new Error(
        `No se pudo resolver el defensor ${scenario.defender.id} (${scenario.defender.name}) mapeado como ${defName} en Gen ${gen}. El motor no devolvió stats.`,
      );
    }

    const defenderHp = defender.stats.hp;
    if (typeof defenderHp !== "number" || defenderHp <= 0) {
      throw new Error(
        `No se pudo resolver el HP del defensor ${scenario.defender.id} (${scenario.defender.name}) mapeado como ${defName} en Gen ${gen}. HP inválido (${defenderHp}). Esto suele pasar con formas Mega Z / Gmax no soportadas. Prueba con la forma base.`,
      );
    }

    if (!attacker?.stats?.hp) {
      throw new Error(
        `No se pudo resolver el atacante ${scenario.attacker.id} (${scenario.attacker.name}) mapeado como ${atkName} en Gen ${gen}.`,
      );
    }

    let move: InstanceType<typeof Move>;
    try {
      move = new Move(gen, scenario.moveName, {
        ...(scenario.conditions.isCriticalHit !== undefined
          ? { isCrit: scenario.conditions.isCriticalHit }
          : {}),
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(
        `Movimiento "${scenario.moveName}" no reconocido en Gen ${gen}: ${message}`,
      );
    }

    const field = new Field({
      ...(scenario.conditions.weather
        ? { weather: scenario.conditions.weather as SmogonWeather }
        : {}),
      ...(scenario.conditions.terrain
        ? { terrain: scenario.conditions.terrain as SmogonTerrain }
        : {}),
    });

    let result: ReturnType<typeof calculate>;
    try {
      result = calculate(gen, attacker, defender, move, field);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(`Error en el cálculo de Smogon: ${message}`);
    }

    if (!result || typeof result.range !== "function") {
      throw new Error(
        "El motor de Smogon no devolvió un resultado válido. Posible incompatibilidad de forma o movimiento.",
      );
    }

    const range = result.range();

    if (!range || range.length < 2) {
      throw new Error(
        `Rango de daño inválido: ${JSON.stringify(range)}. Verifica movimiento y generación.`,
      );
    }

    const minDamage = range[0] ?? 0;
    const maxDamage = range[1] ?? 0;
    const minPercent = Number(((minDamage / defenderHp) * 100).toFixed(1));
    const maxPercent = Number(((maxDamage / defenderHp) * 100).toFixed(1));

    let ko: { n: number; chance?: number | undefined } = { n: 0, chance: 0 };
    let summary = "El ataque no hace daño o el objetivo es inmune.";

    if (maxDamage > 0) {
      try {
        ko = result.kochance();
        summary = result.desc();
      } catch (_e) {
        ko = { n: 0, chance: 0 };
      }
    }

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

    if (summary.includes("STAB")) activeModifiers.push("STAB x1.5");
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
      explanation: { summary, activeModifiers, context },
    };
  }
}
