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
  BattleResult,
  BattleExplanationFactor,
} from "@/domain/battle/types/BattleTypes";

// Definimos los tipos literales que Smogon espera, evitando importar tipos internos inestables
type SmogonWeather = "Sand" | "Sun" | "Rain" | "Hail" | "Snow";
type SmogonTerrain = "Electric" | "Grassy" | "Psychic" | "Misty";

// Interfaces locales para tipar estrictamente las opciones dinámicas sin usar 'any'
interface SmogonPokemonOptions {
  level: number;
  nature: string;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  ability?: string;
  item?: string;
}

interface SmogonMoveOptions {
  isCrit?: boolean;
}

interface SmogonFieldOptions {
  weather?: SmogonWeather;
  terrain?: SmogonTerrain;
}

export class SmogonCalculatorAdapter implements BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult {
    // 1. Mapear Atacante
    const attackerOptions: SmogonPokemonOptions = {
      level: scenario.attacker.level,
      nature: scenario.attacker.nature.name,
      evs: scenario.attacker.evs,
      ivs: scenario.attacker.ivs,
    };
    if (scenario.attacker.ability)
      attackerOptions.ability = scenario.attacker.ability;
    if (scenario.attacker.item) attackerOptions.item = scenario.attacker.item;

    const attacker = new Pokemon(
      scenario.generation as GenerationNum,
      scenario.attacker.name,
      attackerOptions,
    );

    // 2. Mapear Defensor
    const defenderOptions: SmogonPokemonOptions = {
      level: scenario.defender.level,
      nature: scenario.defender.nature.name,
      evs: scenario.defender.evs,
      ivs: scenario.defender.ivs,
    };
    if (scenario.defender.ability)
      defenderOptions.ability = scenario.defender.ability;
    if (scenario.defender.item) defenderOptions.item = scenario.defender.item;

    const defender = new Pokemon(
      scenario.generation as GenerationNum,
      scenario.defender.name,
      defenderOptions,
    );

    // 3. Mapear Movimiento
    const moveOptions: SmogonMoveOptions = {};
    if (scenario.conditions.isCriticalHit !== undefined) {
      moveOptions.isCrit = scenario.conditions.isCriticalHit;
    }
    const move = new Move(
      scenario.generation as GenerationNum,
      scenario.moveName,
      moveOptions,
    );

    // 4. Mapear Campo (Condiciones)
    const fieldOptions: SmogonFieldOptions = {};
    if (scenario.conditions.weather) {
      fieldOptions.weather = scenario.conditions.weather as SmogonWeather;
    }
    if (scenario.conditions.terrain) {
      fieldOptions.terrain = scenario.conditions.terrain as SmogonTerrain;
    }
    const field = new Field(fieldOptions);

    // 5. Ejecutar cálculo de la librería externa
    const result = calculate(
      scenario.generation as GenerationNum,
      attacker,
      defender,
      move,
      field,
    );

    // 6. Traducir resultados al Dominio PokeGuide
    const damageRange = result.range();
    const defenderHp = defender.stats.hp;

    const minPercent = Number(((damageRange[0] / defenderHp) * 100).toFixed(1));
    const maxPercent = Number(((damageRange[1] / defenderHp) * 100).toFixed(1));

    const isOHKO = damageRange[0] >= defenderHp;
    const isGuaranteed = damageRange[0] >= defenderHp;

    const damageRolls: number[] =
      typeof result.damage === "number"
        ? [result.damage]
        : (result.damage as number[]);

    // 7. Capa de Explicación (Explainability Layer)
    const factors: BattleExplanationFactor[] = [];
    if (scenario.attacker.item) {
      factors.push({
        label: "Objeto Atacante",
        description: `Equipado con ${scenario.attacker.item}.`,
      });
    }
    if (scenario.conditions.weather) {
      factors.push({
        label: "Clima",
        description: `El clima actual es ${scenario.conditions.weather}.`,
      });
    }

    return {
      damage: {
        minDamage: damageRange[0],
        maxDamage: damageRange[1],
        minPercent,
        maxPercent,
        damageRolls,
      },
      koAnalysis: {
        hitsToKO: isOHKO ? 1 : Math.ceil(defenderHp / damageRange[1]),
        guaranteed: isGuaranteed,
        probability: isGuaranteed ? 100 : isOHKO ? 50 : 0,
      },
      explanation: {
        summary: result.desc(),
        factors,
      },
    };
  }
}
