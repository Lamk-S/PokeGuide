import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { BattleCalculator } from "@/domain/battle/repositories/BattleCalculator";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type {
  BattleResult,
  BattleConditions as BattleTypesConditions,
  BattlePokemon,
} from "@/domain/battle/types/BattleTypes";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import type {
  BattleScenario,
  BattleParticipant,
} from "@/domain/battle/entities/BattleScenario";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { calculateStats } from "@/domain/stats/services/StatCalculator";

type FlexibleStatValue = number | { value: number };
type FlexibleStatRecord = Record<string, FlexibleStatValue | undefined>;

function normalizeStats(
  input: FlexibleStatRecord | undefined,
): Record<StatName, number> {
  const result = {} as Record<StatName, number>;
  const statNames: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  if (!input) {
    for (const name of statNames) {
      result[name] = 0;
    }
    return result;
  }

  for (const stat of statNames) {
    const raw = input[stat];
    if (raw === undefined) {
      result[stat] = 0;
    } else if (typeof raw === "number") {
      result[stat] = raw;
    } else if (typeof raw === "object" && raw !== null && "value" in raw) {
      const v = (raw as { value: unknown }).value;
      result[stat] = typeof v === "number" ? v : 0;
    } else {
      result[stat] = 0;
    }
  }

  return result;
}

function normalizeConditions(conditions: BattleTypesConditions | undefined): {
  weather: WeatherId;
  terrain: TerrainId;
} {
  const weather = conditions?.weather ?? "none";
  const terrain = conditions?.terrain ?? "none";
  return {
    weather: weather as WeatherId,
    terrain: terrain as TerrainId,
  };
}

function hasIsCriticalHit(obj: unknown): obj is { isCriticalHit: boolean } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "isCriticalHit" in obj &&
    typeof (obj as { isCriticalHit: unknown }).isCriticalHit === "boolean"
  );
}

export class CalculateBattleScenarioUseCase {
  constructor(
    private readonly pokemonRepo: PokemonRepository,
    private readonly calculator: BattleCalculator,
  ) {}

  async execute(
    generation: number,
    attackerInput: BattleParticipantInput,
    defenderInput: BattleParticipantInput,
    moveName: string,
    conditions: BattleTypesConditions = {},
  ): Promise<BattleResult> {
    const attackerEntity = await this.pokemonRepo.getById(
      attackerInput.pokemonId,
    );
    const defenderEntity = await this.pokemonRepo.getById(
      defenderInput.pokemonId,
    );
    if (!attackerEntity)
      throw new Error(
        `Pokémon atacante con ID ${attackerInput.pokemonId} no encontrado`,
      );
    if (!defenderEntity)
      throw new Error(
        `Pokémon defensor con ID ${defenderInput.pokemonId} no encontrado`,
      );

    const attackerIvs = normalizeStats(attackerInput.ivs as FlexibleStatRecord);
    const attackerEvs = normalizeStats(attackerInput.evs as FlexibleStatRecord);
    const defenderIvs = normalizeStats(defenderInput.ivs as FlexibleStatRecord);
    const defenderEvs = normalizeStats(defenderInput.evs as FlexibleStatRecord);

    const attackerCalculated = calculateStats({
      baseStats: attackerEntity.baseStats,
      level: attackerInput.level,
      nature: attackerInput.nature,
      ivs: attackerIvs,
      evs: attackerEvs,
      generation,
    });
    const defenderCalculated = calculateStats({
      baseStats: defenderEntity.baseStats,
      level: defenderInput.level,
      nature: defenderInput.nature,
      ivs: defenderIvs,
      evs: defenderEvs,
      generation,
    });

    const attackerPokemon: BattlePokemon = {
      id: attackerEntity.id,
      name: attackerEntity.name,
      level: attackerInput.level,
      nature: attackerInput.nature,
      evs: attackerEvs,
      ivs: attackerIvs,
      calculatedStats: attackerCalculated,
      ...(attackerInput.ability ? { ability: attackerInput.ability } : {}),
      ...(attackerInput.item ? { item: attackerInput.item } : {}),
      ...(attackerInput.status ? { status: attackerInput.status } : {}),
    };

    const defenderPokemon: BattlePokemon = {
      id: defenderEntity.id,
      name: defenderEntity.name,
      level: defenderInput.level,
      nature: defenderInput.nature,
      evs: defenderEvs,
      ivs: defenderIvs,
      calculatedStats: defenderCalculated,
      ...(defenderInput.ability ? { ability: defenderInput.ability } : {}),
      ...(defenderInput.item ? { item: defenderInput.item } : {}),
      ...(defenderInput.status ? { status: defenderInput.status } : {}),
    };

    const normalizedConditions = normalizeConditions(conditions);

    const criticalFromInput = attackerInput.isCriticalHit ?? false;
    const criticalFromLegacyConditions = hasIsCriticalHit(conditions)
      ? conditions.isCriticalHit
      : false;
    const isCriticalHit = criticalFromInput || criticalFromLegacyConditions;

    const attackerParticipant: BattleParticipant = {
      id: attackerPokemon.id,
      name: attackerPokemon.name,
      level: attackerInput.level,
      nature: attackerInput.nature,
      evs: attackerEvs,
      ivs: attackerIvs,
      ability: attackerInput.ability ?? attackerInput.abilityId ?? undefined,
      abilityId: attackerInput.abilityId ?? undefined,
      item: attackerInput.item ?? undefined,
      status: attackerInput.status ?? undefined,
      isCriticalHit,
    };

    const defenderParticipant: BattleParticipant = {
      id: defenderPokemon.id,
      name: defenderPokemon.name,
      level: defenderInput.level,
      nature: defenderInput.nature,
      evs: defenderEvs,
      ivs: defenderIvs,
      ability: defenderInput.ability ?? defenderInput.abilityId ?? undefined,
      abilityId: defenderInput.abilityId ?? undefined,
      item: defenderInput.item ?? undefined,
      status: defenderInput.status ?? undefined,
    };

    const scenario: BattleScenario = {
      generation,
      attacker: attackerParticipant,
      defender: defenderParticipant,
      moveName,
      moveId: moveName.toLowerCase().replace(/\s+/g, "-"),
      conditions: normalizedConditions,
    };

    return this.calculator.calculate(scenario);
  }
}
