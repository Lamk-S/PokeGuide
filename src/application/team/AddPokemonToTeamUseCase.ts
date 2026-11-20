import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import { NATURES } from "@/domain/stats/constants/natures";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { EV } from "@/domain/stats/value-objects/EV";
import { IV } from "@/domain/stats/value-objects/IV";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type {
  BaseStats,
  EVSet,
  IVSet,
  TeamMember,
} from "@/domain/team/types/TeamTypes";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

export interface AddPokemonInput {
  readonly pokemonId?: number;
  readonly pokemonName?: string;
  readonly level?: number;
  readonly natureName?: string;
  readonly evs?: Partial<EVSet>;
  readonly ivs?: Partial<IVSet>;
  readonly moveIds: readonly string[];
  readonly abilityId?: string;
  readonly itemId?: string;
  readonly teraType?: PokemonType;
  readonly isTeraActive?: boolean;
}

function resolveNature(name?: string): Nature {
  const fallback = (NATURES[0] ?? {
    name: "Hardy",
    nameEs: "Fuerte",
    increasedStat: null,
    decreasedStat: null,
  }) as Nature;
  if (!name) return fallback;
  const q = normalizeId(name);
  return (
    NATURES.find(
      (n) => normalizeId(n.name) === q || normalizeId(n.nameEs) === q,
    ) ?? fallback
  );
}

function toBaseStats(record: Record<string, number>): BaseStats {
  const r = record as Record<string, number | undefined>;
  return {
    hp: r.hp ?? 80,
    attack: r.attack ?? 80,
    defense: r.defense ?? 80,
    "special-attack": r["special-attack"] ?? r.specialAttack ?? 80,
    "special-defense": r["special-defense"] ?? r.specialDefense ?? 80,
    speed: r.speed ?? 80,
  };
}

export class AddPokemonToTeamUseCase {
  async execute(input: AddPokemonInput): Promise<TeamMember> {
    const {
      pokemonId,
      pokemonName,
      level,
      natureName,
      evs,
      ivs,
      moveIds,
      abilityId,
      itemId,
      teraType,
      isTeraActive,
    } = input;
    let baseData = null;
    if (pokemonId) baseData = await LocalPokemonRepository.getById(pokemonId);
    if (!baseData && pokemonName)
      baseData = await LocalPokemonRepository.getByName(pokemonName);
    if (!baseData)
      throw new Error(`Pokémon no encontrado: ${pokemonId ?? pokemonName}`);

    const movesDataMap = await LocalMoveRepository.getByIds(
      moveIds as readonly string[],
    );
    const movesData = Array.from(movesDataMap.values());
    if (movesData.length !== moveIds.length) {
      const found = new Set(
        Array.from(movesDataMap.keys()).map((k) => normalizeId(k)),
      );
      const missing = moveIds.filter((id) => !found.has(normalizeId(id)));
      throw new Error(`Movimientos no encontrados: ${missing.join(", ")}`);
    }

    const nature = resolveNature(natureName);
    const lvl = level ?? DEFAULT_BATTLE_RULESET.level;
    const evSet = EV.createSet({
      hp: evs?.hp ?? 0,
      attack: evs?.attack ?? 0,
      defense: evs?.defense ?? 0,
      "special-attack": evs?.["special-attack"] ?? 0,
      "special-defense": evs?.["special-defense"] ?? 0,
      speed: evs?.speed ?? 0,
    });
    const ivSet = IV.createSet({
      hp: ivs?.hp ?? 31,
      attack: ivs?.attack ?? 31,
      defense: ivs?.defense ?? 31,
      "special-attack": ivs?.["special-attack"] ?? 31,
      "special-defense": ivs?.["special-defense"] ?? 31,
      speed: ivs?.speed ?? 31,
    });
    const baseStatsTyped: BaseStats = toBaseStats(
      (baseData.baseStats ?? {}) as Record<string, number>,
    );
    const calculated = calculateStats({
      baseStats: baseStatsTyped,
      ivs: ivSet as Partial<Record<string, number>>,
      evs: evSet as Partial<Record<string, number>>,
      level: lvl,
      nature,
      generation: DEFAULT_BATTLE_RULESET.generation,
    });
    const normalizedMoveIds = Object.freeze([
      ...moveIds.map((id: string) => normalizeId(id)),
    ]) as readonly string[];
    const resolvedTeraType: PokemonType | null = teraType
      ? (teraType as PokemonType)
      : null;
    const firstAbility = (() => {
      const ab = baseData.abilities?.[0];
      if (!ab) return null;
      if (typeof ab === "string") return ab;
      const obj = ab as Record<string, unknown>;
      return (obj.name as string) ?? (obj.id as string) ?? null;
    })();

    const member: TeamMember = Object.freeze({
      id: `${baseData.id}-${Date.now()}`,
      pokemonId: baseData.id,
      name: baseData.name,
      displayNameEs: baseData.displayNameEs,
      species: baseData.name,
      types: Object.freeze([...baseData.types]) as readonly PokemonType[],
      abilityId: abilityId
        ? normalizeId(abilityId)
        : firstAbility
          ? normalizeId(firstAbility)
          : null,
      itemId: itemId ? normalizeId(itemId) : null,
      ability: abilityId ?? firstAbility ?? null,
      item: itemId ?? null,
      nature,
      level: lvl,
      evs: evSet as EVSet,
      ivs: ivSet as IVSet,
      baseStats: baseStatsTyped,
      calculatedStats: {
        hp: calculated.hp,
        attack: calculated.attack,
        defense: calculated.defense,
        specialAttack: calculated["special-attack"],
        specialDefense: calculated["special-defense"],
        speed: calculated.speed,
      },
      moves: normalizedMoveIds,
      teraType: resolvedTeraType,
      isTeraActive: isTeraActive ?? false,
    });
    return member;
  }
}
