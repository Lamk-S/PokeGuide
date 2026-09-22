import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { Pokemon, PokemonId } from "@/domain/pokemon/types/pokemon";
import dataset from "@/../data/pokemon/dataset.json";

export class LocalPokemonRepository implements PokemonRepository {
  private readonly byId: Map<PokemonId, Pokemon>;
  private readonly byName: Map<string, Pokemon>;
  private readonly all: Pokemon[];

  constructor() {
    try {
      const list = dataset as Pokemon[];
      console.log(
        "[LocalPokemonRepository] dataset loaded:",
        list.length,
        "pokemons",
      );
      if (!Array.isArray(list) || list.length === 0) {
        console.warn(
          "[LocalPokemonRepository] dataset.json está vacío o no es un array",
        );
      }
      this.all = list;
      this.byId = new Map(list.map((p) => [p.id, p]));
      this.byName = new Map(list.map((p) => [p.name.toLowerCase(), p]));
    } catch (e) {
      console.error("[LocalPokemonRepository] Error cargando dataset.json:", e);
      console.error(
        "Verifica que el archivo existe en /data/pokemon/dataset.json y que el alias @/../data resuelve bien con Turbopack",
      );
      this.all = [];
      this.byId = new Map();
      this.byName = new Map();
    }
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
