import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { Pokemon, PokemonId } from "@/domain/pokemon/types/pokemon";
import dataset from "@/../data/pokemon/dataset.json";
import customForms from "@/../data/pokemon/custom-forms.json";

export class LocalPokemonRepository implements PokemonRepository {
  private readonly byId: Map<PokemonId, Pokemon>;
  private readonly byName: Map<string, Pokemon>;
  private readonly all: Pokemon[];

  constructor() {
    try {
      const baseList = dataset as Pokemon[];
      const formsList = customForms as Pokemon[];
      const combined = [...baseList, ...formsList] as Pokemon[];

      const seen = new Set<number>();
      const list: Pokemon[] = [];
      for (const p of combined) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          list.push(p);
        }
      }

      console.log(
        "[LocalPokemonRepository] dataset loaded:",
        baseList.length,
        "base +",
        formsList.length,
        "custom =",
        list.length,
        "pokemons",
      );
      if (!Array.isArray(list) || list.length === 0) {
        console.warn(
          "[LocalPokemonRepository] dataset.json + custom-forms.json están vacíos o no son arrays",
        );
      }
      this.all = list.sort((a, b) => a.id - b.id);
      this.byId = new Map(list.map((p) => [p.id, p]));
      this.byName = new Map(list.map((p) => [p.name.toLowerCase(), p]));
    } catch (e) {
      console.error("[LocalPokemonRepository] Error cargando dataset.json:", e);
      console.error(
        "Verifica que los archivos existen en /data/pokemon/dataset.json y custom-forms.json y que el alias @/../data resuelve bien con Turbopack",
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
