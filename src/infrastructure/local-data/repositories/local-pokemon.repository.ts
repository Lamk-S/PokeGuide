import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import datasetOptimized from "../../../../data/pokemon/dataset.optimized.json";
import datasetEs from "../../../../data/pokemon/dataset.es.json";

type PokemonOptimized = {
  id: number;
  name: string;
  nameEs: string;
  types: string[];
  bst: number;
  sprite: string;
  isCustom: boolean;
};

type PokemonWithEs = Pokemon & {
  nameEs?: string;
  isCustom?: boolean;
};

export class LocalPokemonRepository {
  private readonly pokemonOptimized: PokemonOptimized[];
  private readonly pokemonFull: PokemonWithEs[];
  private readonly byName: Map<string, PokemonWithEs>;
  private readonly byId: Map<number, PokemonWithEs>;

  constructor() {
    this.pokemonOptimized = datasetOptimized as PokemonOptimized[];
    this.pokemonFull = datasetEs as PokemonWithEs[];

    this.byName = new Map(
      this.pokemonFull.map((p) => [p.name.toLowerCase(), p]),
    );
    this.byId = new Map(this.pokemonFull.map((p) => [p.id, p]));
  }

  async getAllOptimized(): Promise<PokemonOptimized[]> {
    return [...this.pokemonOptimized];
  }

  async searchOptimized(query: string): Promise<PokemonOptimized[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...this.pokemonOptimized];
    return this.pokemonOptimized.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEs.toLowerCase().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q)),
    );
  }

  async getAll(): Promise<PokemonWithEs[]> {
    return [...this.pokemonFull];
  }

  async getByName(name: string): Promise<PokemonWithEs | null> {
    return this.byName.get(name.toLowerCase().trim()) ?? null;
  }

  async getById(id: number): Promise<PokemonWithEs | null> {
    return this.byId.get(id) ?? null;
  }

  async getByNameEs(nameEs: string): Promise<PokemonWithEs | null> {
    const normalized = nameEs.toLowerCase().trim();
    return (
      this.pokemonFull.find(
        (p) => (p.nameEs || p.name).toLowerCase() === normalized,
      ) ?? null
    );
  }

  async search(query: string): Promise<PokemonWithEs[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...this.pokemonFull];
    return this.pokemonFull.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameEs?.toLowerCase().includes(q) ||
        p.types.some((t) => t.toLowerCase().includes(q)),
    );
  }

  async getByType(type: string): Promise<PokemonWithEs[]> {
    const t = type.toLowerCase().trim();
    return this.pokemonFull.filter((p) =>
      p.types.some((ty) => ty.toLowerCase() === t),
    );
  }

  async getCustomForms(): Promise<PokemonWithEs[]> {
    return this.pokemonFull.filter((p) => p.isCustom === true);
  }

  async getByBstRange(min: number, max: number): Promise<PokemonOptimized[]> {
    return this.pokemonOptimized.filter((p) => p.bst >= min && p.bst <= max);
  }
}
