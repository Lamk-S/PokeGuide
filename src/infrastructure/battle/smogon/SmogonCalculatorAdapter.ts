import { calculate, Generations, Pokemon, Move, Field } from "@smogon/calc";
import type { GenerationNum } from "@smogon/calc";
import { SmogonSpeciesMapper } from "./SmogonSpeciesMapper";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type {
  IResolvedBattleScenario,
  BattleResult,
} from "@/domain/battle/types/BattleParticipant";
import { BattleStatusEffectService } from "@/domain/battle/services/BattleStatusEffectService";

type RawFieldOptions = NonNullable<ConstructorParameters<typeof Field>[0]>;
type SmogonWeather = NonNullable<RawFieldOptions["weather"]>;
type SmogonTerrain = NonNullable<RawFieldOptions["terrain"]>;
type RawPokemonOptions = NonNullable<ConstructorParameters<typeof Pokemon>[2]>;
type SmogonStatus = NonNullable<RawPokemonOptions["status"]>;

function toSmogonStatus(
  status: string | null | undefined,
): SmogonStatus | undefined {
  if (!status || status === "none") return undefined;
  const map: Record<string, SmogonStatus> = {
    burn: "brn" as SmogonStatus,
    brn: "brn" as SmogonStatus,
    poison: "psn" as SmogonStatus,
    psn: "psn" as SmogonStatus,
    par: "par" as SmogonStatus,
    sleep: "slp" as SmogonStatus,
    slp: "slp" as SmogonStatus,
    freeze: "frz" as SmogonStatus,
    frz: "frz" as SmogonStatus,
    toxic: "tox" as SmogonStatus,
    tox: "tox" as SmogonStatus,
  };
  return map[status.toLowerCase()];
}

function toSmogonWeather(weather: string): SmogonWeather | undefined {
  if (!weather || weather === "none") return undefined;
  const map: Record<string, SmogonWeather> = {
    rain: "Rain" as SmogonWeather,
    sun: "Sun" as SmogonWeather,
    sand: "Sand" as SmogonWeather,
    hail: "Hail" as SmogonWeather,
    snow: "Snow" as SmogonWeather,
  };
  return map[weather] ?? map[weather.toLowerCase()];
}

function toSmogonTerrain(terrain: string): SmogonTerrain | undefined {
  if (!terrain || terrain === "none") return undefined;
  const map: Record<string, SmogonTerrain> = {
    electric: "Electric" as SmogonTerrain,
    grassy: "Grassy" as SmogonTerrain,
    psychic: "Psychic" as SmogonTerrain,
    misty: "Misty" as SmogonTerrain,
  };
  return map[terrain] ?? map[terrain.toLowerCase()];
}

function computePercent(damage: number, defenderMaxHp: number): number {
  if (defenderMaxHp <= 0) return 0;
  return Math.floor((damage / defenderMaxHp) * 1000) / 10;
}

function buildActiveModifiers(
  scenario: IResolvedBattleScenario,
  moveType: string,
  moveCategory: string,
): string[] {
  const mods: string[] = [];
  const mt = moveType.toLowerCase();
  if (scenario.conditions.weather !== "none") {
    if (scenario.conditions.weather === "rain" && mt === "water")
      mods.push(`Clima: rain potencia Agua`);
    if (scenario.conditions.weather === "sun" && mt === "fire")
      mods.push(`Clima: sun potencia Fuego`);
  }
  if (scenario.conditions.terrain !== "none") {
    if (scenario.conditions.terrain === "electric" && mt === "electric")
      mods.push(`Campo: electric potencia Eléctrico`);
  }
  if (scenario.attacker.isCriticalHit) {
    const mult = BattleStatusEffectService.getCriticalMultiplier(
      scenario.generation,
    );
    mods.push(`Crítico x${mult.toFixed(1)}`);
  }
  if (scenario.attacker.status === "burn" && moveCategory === "Physical") {
    mods.push(`Quemadura x0.5 (Físico reducido)`);
  }
  return mods;
}

export class SmogonCalculatorAdapter implements BattleCalculator {
  calculate(scenario: IResolvedBattleScenario): BattleResult {
    const gen = Generations.get(scenario.generation as GenerationNum);
    const attackerResolved = SmogonSpeciesMapper.resolve(
      { id: scenario.attacker.id, name: scenario.attacker.name },
      scenario.generation,
    );
    const defenderResolved = SmogonSpeciesMapper.resolve(
      { id: scenario.defender.id, name: scenario.defender.name },
      scenario.generation,
    );

    if (!attackerResolved.supported && !attackerResolved.isFallbackToBase)
      throw new Error(
        `La forma ${scenario.attacker.name} no está disponible en Gen ${scenario.generation}`,
      );
    if (!defenderResolved.supported && !defenderResolved.isFallbackToBase)
      throw new Error(
        `La forma ${scenario.defender.name} no está disponible en Gen ${scenario.generation}`,
      );

    const attackerStatus = toSmogonStatus(scenario.attacker.status);
    const defenderStatus = toSmogonStatus(scenario.defender.status);

    const attackerOptions: RawPokemonOptions = {
      level: scenario.attacker.level,
      nature: scenario.attacker.nature.name,
      evs: { ...scenario.attacker.evs },
      ivs: { ...scenario.attacker.ivs },
    };
    if (scenario.attacker.ability)
      attackerOptions.ability = scenario.attacker.ability;
    if (scenario.attacker.item) attackerOptions.item = scenario.attacker.item;
    if (attackerStatus) attackerOptions.status = attackerStatus;

    const defenderOptions: RawPokemonOptions = {
      level: scenario.defender.level,
      nature: scenario.defender.nature.name,
      evs: { ...scenario.defender.evs },
      ivs: { ...scenario.defender.ivs },
    };
    if (scenario.defender.ability)
      defenderOptions.ability = scenario.defender.ability;
    if (scenario.defender.item) defenderOptions.item = scenario.defender.item;
    if (defenderStatus) defenderOptions.status = defenderStatus;

    const attacker = new Pokemon(
      gen,
      attackerResolved.smogonName,
      attackerOptions,
    );
    const defender = new Pokemon(
      gen,
      defenderResolved.smogonName,
      defenderOptions,
    );
    const move = new Move(gen, scenario.moveName);

    const fieldOptions: RawFieldOptions = {};
    const w = toSmogonWeather(scenario.conditions.weather);
    const t = toSmogonTerrain(scenario.conditions.terrain);
    if (w) fieldOptions.weather = w;
    if (t) fieldOptions.terrain = t;

    const field = new Field(fieldOptions);
    const result = calculate(gen, attacker, defender, move, field);
    const range = result.range();
    const minDamage = range[0];
    const maxDamage = range[1];
    const defenderMaxHp = defender.maxHP();
    const minPercent = computePercent(minDamage, defenderMaxHp);
    const maxPercent = computePercent(maxDamage, defenderMaxHp);
    const isImmune = minDamage === 0 && maxDamage === 0;
    const isOHKO = !isImmune && minDamage >= defenderMaxHp;
    const hitsToKO = isImmune
      ? 0
      : maxDamage === 0
        ? 99
        : Math.ceil(defenderMaxHp / maxDamage);
    const guaranteed = minDamage >= defenderMaxHp;
    const probability = isImmune ? 0 : guaranteed ? 100 : 50;
    let activeModifiers = buildActiveModifiers(
      scenario,
      move.type,
      move.category,
    );
    if (move.category !== "Physical")
      activeModifiers = activeModifiers.filter((m) => !m.includes("Quemadura"));
    const summary = isImmune
      ? `${scenario.moveName} no hace daño a ${defenderResolved.smogonName} (inmune)`
      : `${scenario.moveName} hace ${minDamage}-${maxDamage} (${minPercent} - ${maxPercent}%)`;
    return {
      damage: { minDamage, maxDamage, minPercent, maxPercent },
      koAnalysis: { guaranteed, hitsToKO, probability },
      explanation: { summary, activeModifiers },
      defenderMaxHp,
      isOHKO,
      effectiveness: isImmune ? 0 : 1,
      moveCategoryUsed: move.category,
    };
  }
}
