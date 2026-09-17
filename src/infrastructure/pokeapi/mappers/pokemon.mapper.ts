import type {
  Pokemon,
  PokemonMoveRef,
  PokemonAbilityRef,
  StatName,
} from "@/domain/pokemon/types/pokemon";
import type { PokeApiPokemonDto } from "../schemas/pokemon.schema";

export function mapPokeApiToPokemon(dto: PokeApiPokemonDto): Pokemon {
  const baseStats: Record<StatName, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };

  for (const current of dto.stats) {
    const statName = current.stat.name as StatName;
    if (baseStats[statName] !== undefined) {
      baseStats[statName] = current.base_stat;
    }
  }

  const abilities: PokemonAbilityRef[] = dto.abilities
    .sort((a, b) => a.slot - b.slot)
    .map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
      slot: a.slot,
    }));

  const moves: PokemonMoveRef[] = dto.moves.flatMap((m): PokemonMoveRef[] => {
    const details = m.version_group_details;
    const isMachine = details.some(
      (d) => d.move_learn_method.name === "machine",
    );

    if (isMachine) {
      return [{ name: m.move.name, learnMethod: "machine", levelLearnedAt: 0 }];
    }

    const levelUpDetails = details.filter(
      (d) => d.move_learn_method.name === "level-up",
    );
    if (levelUpDetails.length > 0) {
      const minLevel = Math.min(
        ...levelUpDetails.map((d) => d.level_learned_at),
      );
      return [
        {
          name: m.move.name,
          learnMethod: "level-up",
          levelLearnedAt: minLevel,
        },
      ];
    }

    return [];
  });

  return {
    id: dto.id,
    name: dto.name,
    types: dto.types.map((t) => t.type.name),
    baseStats,
    height: dto.height,
    weight: dto.weight,
    abilities,
    moves,
  };
}
