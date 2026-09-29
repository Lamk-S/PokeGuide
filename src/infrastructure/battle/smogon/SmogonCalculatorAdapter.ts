import {
  calculate,
  Pokemon,
  Move,
  Field,
  type GenerationNum,
  type Result,
} from "@smogon/calc";
import { SmogonSpeciesMapper } from "./SmogonSpeciesMapper";
import {
  Weather,
  Terrain,
  Status,
  type WeatherId,
  type TerrainId,
  type StatusId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import {
  evaluateBurn,
  getCriticalLog,
} from "@/domain/battle/services/BattleStatusEffectService";
import { MoveCategory } from "@/domain/battle/value-objects/MoveCategory";

const STAT_TO_SMOGON: Record<
  StatName,
  "hp" | "atk" | "def" | "spa" | "spd" | "spe"
> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spa",
  "special-defense": "spd",
  speed: "spe",
};

function toSmogonStats(input?: Record<StatName, number>) {
  const base = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  if (!input) return base;
  for (const [k, v] of Object.entries(input)) {
    const smogonKey = STAT_TO_SMOGON[k as StatName];
    if (smogonKey) base[smogonKey] = Math.max(0, v ?? 0);
  }
  return base;
}

type SmogonStatus = "" | "brn" | "par" | "psn" | "tox" | "slp" | "frz";

type SmogonPokemonBaseOpts = {
  level: number;
  nature: string;
  evs: ReturnType<typeof toSmogonStats>;
  ivs: ReturnType<typeof toSmogonStats>;
};

type SmogonPokemonFullOpts = SmogonPokemonBaseOpts & {
  ability?: string;
  item?: string;
  status?: SmogonStatus;
};

function resolveMoveCategory(smogonMove: Move): MoveCategory {
  const rawCategory = (smogonMove as unknown as { category?: string }).category;

  if (rawCategory === "Physical") return MoveCategory.PHYSICAL;
  if (rawCategory === "Special") return MoveCategory.SPECIAL;
  if (rawCategory === "Status") return MoveCategory.STATUS;

  const moveWithDesc = smogonMove as unknown as {
    basePower?: number;
    category?: string;
  };

  if (!moveWithDesc.basePower || moveWithDesc.basePower === 0) {
    return MoveCategory.STATUS;
  }

  return MoveCategory.STATUS;
}

export class SmogonCalculatorAdapter implements BattleCalculator {
  calculate(scenario: BattleScenario): BattleResult {
    const attackerRes = SmogonSpeciesMapper.resolve(
      { id: scenario.attacker.id, name: scenario.attacker.name },
      scenario.generation,
    );
    const defenderRes = SmogonSpeciesMapper.resolve(
      { id: scenario.defender.id, name: scenario.defender.name },
      scenario.generation,
    );

    this.assertSupported(attackerRes, scenario.attacker, scenario.generation);
    this.assertSupported(defenderRes, scenario.defender, scenario.generation);

    const attacker = this.createPokemon(
      attackerRes.smogonName,
      scenario.attacker,
      scenario.generation,
    );
    const defender = this.createPokemon(
      defenderRes.smogonName,
      scenario.defender,
      scenario.generation,
    );

    const isCriticalHit =
      scenario.attacker.isCriticalHit ??
      (scenario as unknown as { conditions: { isCriticalHit?: boolean } })
        .conditions.isCriticalHit ??
      false;

    const move = this.createMove(
      scenario.moveName,
      scenario.generation,
      isCriticalHit,
    );

    const field = this.createField(scenario.conditions);

    const result = calculate(
      scenario.generation as GenerationNum,
      attacker,
      defender,
      move,
      field,
    );
    if (!result?.range)
      throw new Error("Motor Smogon no devolvió rango válido");

    const moveCategory = scenario.moveCategory || resolveMoveCategory(move);

    return this.parseResult(result, defender, scenario, move, moveCategory);
  }

  private assertSupported(
    res: ReturnType<typeof SmogonSpeciesMapper.resolve>,
    p: { id: number; name: string },
    gen: number,
  ) {
    const isFallback = !res.supported && res.isFallbackToBase;
    if (!res.supported && !isFallback) {
      const displayName =
        p.name &&
        p.name.trim() !== "" &&
        !p.name.toLowerCase().startsWith("pokemon-")
          ? p.name
          : res.smogonName ||
            SmogonSpeciesMapper.getSmogonNameById(p.id) ||
            `Pokémon ID ${p.id}`;
      throw new Error(
        `Forma ${displayName} no está disponible en Gen ${gen}. ${res.reason ?? ""}`,
      );
    }
  }

  private createPokemon(
    smogonName: string,
    input: BattleScenario["attacker"],
    gen: number,
  ): Pokemon {
    let resolvedName = smogonName;
    if (
      !resolvedName ||
      resolvedName.toLowerCase().startsWith("pokemon-") ||
      resolvedName.trim() === ""
    ) {
      const byId = SmogonSpeciesMapper.getSmogonNameById(input.id);
      if (byId) {
        resolvedName = byId;
      } else if (input.id === 3) {
        resolvedName = "Venusaur";
      } else if (input.id) {
        resolvedName = byId || "Bulbasaur";
      }
    }

    const fallback = SmogonSpeciesMapper.getFallbackForGen9(resolvedName);
    const nameToUse = gen === 9 && fallback ? fallback : resolvedName;

    const base: SmogonPokemonBaseOpts = {
      level: input.level,
      nature: input.nature.name,
      evs: toSmogonStats(input.evs),
      ivs: toSmogonStats(input.ivs),
    };

    const statusId = (input as { status?: StatusId }).status;
    let smogonStatus: SmogonStatus | undefined;
    if (statusId && statusId !== "none") {
      const mapped = Status[statusId]?.smogon as SmogonStatus | undefined;
      if (mapped) smogonStatus = mapped;
    }

    const abilityName = input.abilityId || input.ability;

    const opts: SmogonPokemonFullOpts = {
      ...base,
      ...(abilityName ? { ability: abilityName } : {}),
      ...(input.item ? { item: input.item } : {}),
      ...(smogonStatus ? { status: smogonStatus } : {}),
    };

    try {
      return new Pokemon(gen as GenerationNum, nameToUse, opts);
    } catch (err) {
      console.warn(
        `[SmogonAdapter] Falló crear ${nameToUse} (original: ${smogonName}, id: ${input.id})`,
        err,
      );
      if (fallback && gen === 9) {
        try {
          return new Pokemon(gen as GenerationNum, fallback, opts);
        } catch {}
      }
      const byId = SmogonSpeciesMapper.getSmogonNameById(input.id);
      if (byId && byId !== nameToUse) {
        try {
          return new Pokemon(gen as GenerationNum, byId, opts);
        } catch {}
      }
      const originalError = err instanceof Error ? err.message : String(err);
      throw new Error(
        `No se pudo crear Pokémon ${nameToUse} (id: ${input.id}, original: ${smogonName}): ${originalError}`,
      );
    }
  }

  private createMove(name: string, gen: number, isCrit?: boolean) {
    const opts: { isCrit?: boolean } = {
      ...(typeof isCrit === "boolean" ? { isCrit } : {}),
    };
    return new Move(gen as GenerationNum, name, opts);
  }

  private createField(conditions: BattleScenario["conditions"]) {
    const weatherId = conditions.weather;
    const terrainId = conditions.terrain;

    let weatherValue: string | undefined;
    let terrainValue: string | undefined;

    if (weatherId && weatherId !== "none") {
      const w = Weather[weatherId as WeatherId]?.smogon;
      if (w) weatherValue = w;
    }

    if (terrainId && terrainId !== "none") {
      const t = Terrain[terrainId as TerrainId]?.smogon;
      if (t) terrainValue = t;
    }

    const fieldOpts = {
      ...(weatherValue ? { weather: weatherValue } : {}),
      ...(terrainValue ? { terrain: terrainValue } : {}),
    } as unknown as NonNullable<ConstructorParameters<typeof Field>[0]>;

    return new Field(fieldOpts);
  }

  private parseResult(
    result: Result,
    defender: Pokemon,
    scenario: BattleScenario,
    _smogonMove: Move,
    moveCategory: MoveCategory,
  ): BattleResult {
    const range = result.range();
    if (!range) throw new Error("Sin rango");

    const defenderHp = defender.stats?.hp;
    if (!defenderHp) {
      throw new Error("No se pudo obtener HP del defensor");
    }

    const [minDamage, maxDamage] = range;

    if (maxDamage === 0 && minDamage === 0) {
      return {
        defenderMaxHp: defenderHp,
        damage: {
          minDamage: 0,
          maxDamage: 0,
          minPercent: 0,
          maxPercent: 0,
        },
        koAnalysis: {
          hitsToKO: 0,
          guaranteed: false,
          probability: 0,
        },
        explanation: {
          summary: "El ataque no hace daño por inmunidad (0%)",
          activeModifiers: [],
          context: [],
        },
      };
    }

    let summary: string;
    try {
      summary = result.desc();
    } catch {
      try {
        summary = result.fullDesc();
      } catch {
        summary = `${minDamage}-${maxDamage} daño`;
      }
    }

    type KOChanceResult = { n: number; chance?: number; text?: string };
    let koChanceResult: KOChanceResult | undefined;
    try {
      koChanceResult = result.kochance() as KOChanceResult;
    } catch {
      koChanceResult = undefined;
    }

    const activeModifiers: string[] = [];
    if (summary.includes("STAB")) activeModifiers.push("STAB x1.5");

    const isCrit = scenario.attacker.isCriticalHit ?? false;
    if (isCrit) {
      activeModifiers.push(getCriticalLog(scenario.generation));
    }

    const WEATHER_ES: Record<string, string> = {
      none: "Ninguno",
      sun: "Sol",
      rain: "Lluvia",
      sand: "Tormenta arena",
      hail: "Granizo",
      snow: "Nieve",
      harsh_sun: "Sol intenso",
      heavy_rain: "Lluvia intensa",
      strong_winds: "Vientos fuertes",
      Sun: "Sol",
      Rain: "Lluvia",
      Sand: "Tormenta arena",
      Hail: "Granizo",
      Snow: "Nieve",
      "Harsh Sunshine": "Sol intenso",
      "Heavy Rain": "Lluvia intensa",
      "Strong Winds": "Vientos fuertes",
    };
    const TERRAIN_ES: Record<string, string> = {
      none: "Ninguno",
      electric: "Eléctrico",
      grassy: "Hierba",
      misty: "Niebla",
      psychic: "Psíquico",
      "Electric Terrain": "Eléctrico",
      "Grassy Terrain": "Hierba",
      "Misty Terrain": "Niebla",
      "Psychic Terrain": "Psíquico",
      Electric: "Eléctrico",
      Grassy: "Hierba",
    };
    if (
      result.rawDesc.weather ||
      (scenario.conditions.weather && scenario.conditions.weather !== "none")
    ) {
      const rawWeather =
        result.rawDesc.weather || scenario.conditions.weather || "none";
      const weatherEs =
        WEATHER_ES[rawWeather] ||
        WEATHER_ES[rawWeather.toLowerCase()] ||
        rawWeather;
      activeModifiers.push(`Clima: ${weatherEs}`);
    }
    if (
      result.rawDesc.terrain ||
      (scenario.conditions.terrain && scenario.conditions.terrain !== "none")
    ) {
      const rawTerrain =
        result.rawDesc.terrain || scenario.conditions.terrain || "none";
      const terrainEs =
        TERRAIN_ES[rawTerrain] ||
        TERRAIN_ES[rawTerrain.toLowerCase()] ||
        rawTerrain;
      activeModifiers.push(`Campo: ${terrainEs}`);
    }

    if (result.rawDesc.isBurned) {
      const burnResult = evaluateBurn({
        moveId: scenario.moveId || scenario.moveName,
        moveName: scenario.moveDisplayName || scenario.moveName,
        moveCategory,
        abilityId: scenario.attacker.abilityId || scenario.attacker.ability,
        abilityName: scenario.attacker.ability,
      });
      activeModifiers.push(burnResult.log);
    }

    return {
      defenderMaxHp: defenderHp,
      damage: {
        minDamage,
        maxDamage,
        minPercent: Number(((minDamage / defenderHp) * 100).toFixed(1)),
        maxPercent: Number(((maxDamage / defenderHp) * 100).toFixed(1)),
      },
      koAnalysis: {
        hitsToKO: koChanceResult?.n ?? 0,
        guaranteed: koChanceResult?.chance === 1,
        probability: koChanceResult?.chance
          ? Math.round(koChanceResult.chance * 1000) / 10
          : 0,
      },
      explanation: {
        summary,
        activeModifiers,
        context: [
          ...(result.rawDesc.attackerAbility
            ? [
                {
                  label: `Hab. ${scenario.attacker.name}`,
                  value: result.rawDesc.attackerAbility,
                },
              ]
            : []),
          ...(result.rawDesc.defenderAbility
            ? [
                {
                  label: `Hab. ${scenario.defender.name}`,
                  value: result.rawDesc.defenderAbility,
                },
              ]
            : []),
        ],
      },
    };
  }
}
