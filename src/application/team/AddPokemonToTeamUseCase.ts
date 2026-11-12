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
import { ItemRepository } from "@/infrastructure/repositories/ItemRepository";
import { MoveRepository } from "@/infrastructure/repositories/MoveRepository";
import { PokemonRepository } from "@/infrastructure/repositories/PokemonRepository";

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
  }) as unknown as Nature;
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
  constructor(
    private readonly pokemonRepo = PokemonRepository,
    private readonly moveRepo = MoveRepository,
    private readonly itemRepo = ItemRepository,
  ) {}

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
    if (pokemonId) {
      baseData = await this.pokemonRepo.getById(pokemonId);
    }
    if (!baseData && pokemonName) {
      baseData = await this.pokemonRepo.getByName(pokemonName);
    }
    if (!baseData) {
      throw new Error(`Pokémon no encontrado: ${pokemonId ?? pokemonName}`);
    }

    const movesData = await this.moveRepo.getByNames(moveIds);
    if (movesData.length !== moveIds.length) {
      const found = new Set(movesData.map((m) => m.id));
      const missing = moveIds.filter((id) => !found.has(normalizeId(id)));
      throw new Error(`Movimientos no encontrados: ${missing.join(", ")}`);
    }

    if (itemId) {
      const valid = await this.itemRepo.validate(itemId);
      if (!valid) {
        console.warn(`[AddPokemonToTeamUseCase] Item no válido: ${itemId}`);
      }
    }

    const resolvedMoves = movesData.map((m) => ({
      id: m.id,
      name: m.name,
      nameEs: m.nameEs,
      type: m.type,
      power: m.power,
      accuracy: m.accuracy,
      category: m.category,
      priority: m.priority,
      pp: m.pp,
      effect: m.effect,
      shortEffect: undefined,
      isInvalid: false,
    }));

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
      baseData.baseStats as Record<string, number>,
    );

    const calculated = calculateStats({
      baseStats: baseStatsTyped,
      ivs: ivSet as unknown as Partial<Record<string, number>>,
      evs: evSet as unknown as Partial<Record<string, number>>,
      level: lvl,
      nature,
      generation: DEFAULT_BATTLE_RULESET.generation,
    });

    const member: TeamMember = {
      id: `${baseData.id}-${Date.now()}`,
      pokemonId: baseData.id,
      name: baseData.name,
      displayNameEs: baseData.nameEs,
      species: baseData.nameEs,
      types: baseData.types,
      abilityId: abilityId
        ? normalizeId(abilityId)
        : baseData.abilities[0]
          ? normalizeId(baseData.abilities[0])
          : null,
      itemId: itemId ? normalizeId(itemId) : null,
      ability: abilityId ?? baseData.abilities[0] ?? null,
      item: itemId ?? null,
      nature,
      level: lvl,
      evs: evSet as unknown as EVSet,
      ivs: ivSet as unknown as IVSet,
      baseStats: baseStatsTyped,
      calculatedStats: {
        hp: calculated.hp,
        attack: calculated.attack,
        defense: calculated.defense,
        specialAttack: calculated["special-attack"],
        specialDefense: calculated["special-defense"],
        speed: calculated.speed,
      },
      moves: resolvedMoves as unknown as TeamMember["moves"],
      teraType: teraType as PokemonType | undefined,
      isTeraActive: isTeraActive ?? false,
    };

    return Object.freeze(member) as TeamMember;
  }
}
