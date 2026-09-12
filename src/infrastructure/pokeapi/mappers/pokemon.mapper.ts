import type {
  Pokemon,
  PokemonMoveRef,
  StatName,
} from "@/domain/pokemon/types/pokemon";
import type { PokeApiPokemonDto } from "../schemas/pokemon.schema";

export function mapPokeApiToPokemon(dto: PokeApiPokemonDto): Pokemon {
  const baseStats = dto.stats.reduce(
    (acc, current) => {
      acc[current.stat.name as StatName] = current.base_stat;
      return acc;
    },
    {} as Record<StatName, number>,
  );

  const abilities = dto.abilities.map((a) => a.ability.name);

  const moves: PokemonMoveRef[] = dto.moves
    .map((m) => {
      const details = m.version_group_details;
      const isMachine = details.some(
        (d) => d.move_learn_method.name === "machine",
      );
      const levelUpDetails = details.filter(
        (d) => d.move_learn_method.name === "level-up",
      );

      // Obtenemos el nivel mínimo al que lo aprende por nivel
      const minLevel =
        levelUpDetails.length > 0
          ? Math.min(...levelUpDetails.map((d) => d.level_learned_at))
          : 0;

      return {
        name: m.move.name,
        learnMethod: isMachine
          ? "machine"
          : levelUpDetails.length > 0
            ? "level-up"
            : "other",
        levelLearnedAt: isMachine ? 0 : minLevel,
      };
    })
    .filter((m) => m.learnMethod !== "other") as PokemonMoveRef[];

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
