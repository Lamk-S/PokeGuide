import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { Pokemon, PokemonId } from "@/domain/pokemon/types/pokemon";
import dataset from "@/../data/pokemon/dataset.json";

export class LocalPokemonRepository implements PokemonRepository {
  private readonly byId: Map<PokemonId, Pokemon>;
  private readonly byName: Map<string, Pokemon>;
  private readonly all: Pokemon[];

  constructor() {
    const list = dataset as Pokemon[];
    this.all = list;
    this.byId = new Map(list.map((p) => [p.id, p]));
    this.byName = new Map(list.map((p) => [p.name.toLowerCase(), p]));
  }

  async getById(id: number): Promise<Pokemon | null> {
    return this.byId.get(id) ?? null;
  }

  async getByName(name: string): Promise<Pokemon | null> {
    return this.byName.get(name.toLowerCase()) ?? null;
  }

  async getAll(): Promise<Pokemon[]> {
    return this.all;
  }
}
