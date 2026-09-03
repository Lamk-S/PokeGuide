import type { Pokemon, StatName } from "@/domain/pokemon/types/pokemon";
import type { PokeApiPokemonDto } from "../schemas/pokemon.schema";

// Transforma el DTO externo al modelo de Dominio interno
export function mapPokeApiToPokemon(dto: PokeApiPokemonDto): Pokemon {
  const baseStats = dto.stats.reduce(
    (acc, current) => {
      acc[current.stat.name] = current.base_stat;
      return acc;
    },
    {} as Record<StatName, number>,
  );

  return {
    id: dto.id,
    name: dto.name,
    types: dto.types.map((t) => t.type.name),
    baseStats,
    height: dto.height,
    weight: dto.weight,
  };
}
