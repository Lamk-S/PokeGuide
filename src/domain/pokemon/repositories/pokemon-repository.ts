import type { Pokemon, PokemonId, PokemonName } from "../types/pokemon";

export interface PokemonRepository {
  getById(id: PokemonId): Promise<Pokemon | null>;
  getByName(name: PokemonName): Promise<Pokemon | null>;
  getAll(): Promise<Pokemon[]>;
}
