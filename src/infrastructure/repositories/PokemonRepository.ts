import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface PokemonBaseData {
  readonly id: number;
  readonly name: string;
  readonly nameEs: string;
  readonly types: readonly PokemonType[];
  readonly baseStats: Record<string, number>;
  readonly abilities: readonly string[];
  readonly bst: number;
}

export interface IPokemonRepository {
  getById(id: number): Promise<PokemonBaseData | null>;
  getByName(name: string): Promise<PokemonBaseData | null>;
  search(query: string): Promise<PokemonBaseData[]>;
  getAll(): Promise<PokemonBaseData[]>;
}

type RawPokemon = {
  id: number;
  name: string;
  nameEs?: string;
  types: string[];
  baseStats: Record<string, number>;
  abilities?: string[] | { name: string }[];
  bst?: number;
};

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

let cache: PokemonBaseData[] | null = null;
let idMap: Map<number, PokemonBaseData> | null = null;
let nameMap: Map<string, PokemonBaseData> | null = null;

async function loadDataset(): Promise<PokemonBaseData[]> {
  if (cache) return cache;
  try {
    const mod = await import("../../../data/pokemon/dataset.es.json");
    const raw = extractDefault<RawPokemon[]>(mod);
    cache = raw.map((p) => {
      const abilities: string[] = Array.isArray(p.abilities)
        ? (p.abilities as unknown[])
            .map((a) => {
              if (typeof a === "string") return normalizeId(a);
              if (a && typeof a === "object" && "name" in a) {
                return normalizeId((a as { name: string }).name);
              }
              return "";
            })
            .filter(Boolean)
        : [];
      return {
        id: p.id,
        name: normalizeId(p.name),
        nameEs: String(p.nameEs ?? p.name),
        types: (p.types ?? []).map((t) => normalizeId(t) as PokemonType),
        baseStats: p.baseStats ?? {},
        abilities,
        bst:
          p.bst ??
          Object.values(p.baseStats ?? {}).reduce(
            (a, b) => a + (b as number),
            0,
          ),
      } as PokemonBaseData;
    });
  } catch {
    cache = [];
  }
  idMap = new Map();
  nameMap = new Map();
  for (const p of cache) {
    idMap.set(p.id, p);
    nameMap.set(p.name.toLowerCase(), p);
    nameMap.set(p.nameEs.toLowerCase(), p);
  }
  return cache;
}

export class InMemoryPokemonRepository implements IPokemonRepository {
  async getById(id: number): Promise<PokemonBaseData | null> {
    await loadDataset();
    return idMap?.get(id) ?? null;
  }

  async getByName(name: string): Promise<PokemonBaseData | null> {
    const q = normalizeId(name);
    if (!q) return null;
    await loadDataset();
    return (
      nameMap?.get(q.toLowerCase()) ?? nameMap?.get(name.toLowerCase()) ?? null
    );
  }

  async search(query: string): Promise<PokemonBaseData[]> {
    const q = normalizeId(query.trim().toLowerCase());
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((p) => {
      return (
        p.name.includes(q) ||
        p.nameEs.toLowerCase().includes(q) ||
        p.types.join(" ").includes(q)
      );
    });
  }

  async getAll(): Promise<PokemonBaseData[]> {
    return loadDataset();
  }
}

export const PokemonRepository = new InMemoryPokemonRepository();
