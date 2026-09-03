import type {
  Pokemon,
  PokemonId,
  PokemonName,
} from "@/domain/pokemon/types/pokemon";
import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import pokemonDataset from "../../../../data/pokemon/dataset.json";

// Repositorio que cumple el contrato del dominio leyendo el JSON local
export class LocalPokemonRepository implements PokemonRepository {
  private dataset: Pokemon[] = pokemonDataset as Pokemon[];

  async getById(id: PokemonId): Promise<Pokemon | null> {
    return this.dataset.find((p) => p.id === id) ?? null;
  }

  async getByName(name: PokemonName): Promise<Pokemon | null> {
    return this.dataset.find((p) => p.name === name) ?? null;
  }

  async getAll(): Promise<Pokemon[]> {
    return this.dataset;
  }
}
