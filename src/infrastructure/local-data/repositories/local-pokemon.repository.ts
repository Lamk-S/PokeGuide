type PokemonFull = {
  id: number;
  name: string;
  nameEs?: string;
  types: string[];
  baseStats: Record<string, number>;
  bst?: number;
  [k: string]: unknown;
};
type OptimizedPokemon = {
  id: number;
  name: string;
  nameEs: string;
  types: string[];
  bst: number;
  sprite: string;
  [k: string]: unknown;
};
type CustomForm = {
  id: number;
  name: string;
  types: string[];
  baseStats: Record<string, number>;
  [k: string]: unknown;
};

let fullDataCache: PokemonFull[] | null = null;
let optimizedCache: OptimizedPokemon[] | null = null;
let customFormsCache: CustomForm[] | null = null;
let fullPromise: Promise<PokemonFull[]> | null = null;
let optimizedPromise: Promise<OptimizedPokemon[]> | null = null;
let customPromise: Promise<CustomForm[]> | null = null;
let idMap: Map<number, PokemonFull> | null = null;
let nameMap: Map<string, PokemonFull> | null = null;
let nameEsMap: Map<string, PokemonFull> | null = null;

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}
function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

async function loadFullDataset(): Promise<PokemonFull[]> {
  if (fullDataCache) return fullDataCache;
  if (fullPromise) return fullPromise;
  fullPromise = (async () => {
    const mod = await import("../../../../data/pokemon/dataset.es.json");
    const data = extractDefault<PokemonFull[]>(mod);
    fullDataCache = data;
    idMap = new Map();
    nameMap = new Map();
    nameEsMap = new Map();
    for (const p of fullDataCache) {
      idMap.set(p.id, p);
      nameMap.set(p.name.toLowerCase(), p);
      if (p.nameEs) nameEsMap.set(String(p.nameEs).toLowerCase(), p);
      nameEsMap.set(p.name.toLowerCase(), p);
    }
    return fullDataCache;
  })();
  return fullPromise;
}
async function loadOptimizedDataset(): Promise<OptimizedPokemon[]> {
  if (optimizedCache) return optimizedCache;
  if (optimizedPromise) return optimizedPromise;
  optimizedPromise = (async () => {
    const mod = await import("../../../../data/pokemon/dataset.optimized.json");
    optimizedCache = extractDefault<OptimizedPokemon[]>(mod);
    return optimizedCache;
  })();
  return optimizedPromise;
}
async function loadCustomForms(): Promise<CustomForm[]> {
  if (customFormsCache) return customFormsCache;
  if (customPromise) return customPromise;
  customPromise = (async () => {
    const mod = await import("../../../../data/pokemon/custom-forms.json");
    customFormsCache = extractDefault<CustomForm[]>(mod);
    return customFormsCache;
  })();
  return customPromise;
}

export class LocalPokemonRepository {
  async init(): Promise<void> {
    await Promise.all([loadFullDataset(), loadOptimizedDataset()]);
  }
  async getAll(): Promise<PokemonFull[]> {
    return loadFullDataset();
  }
  async getAllOptimized(): Promise<OptimizedPokemon[]> {
    return loadOptimizedDataset();
  }
  async getById(id: number): Promise<PokemonFull | null> {
    const data = await loadFullDataset();
    if (idMap) return idMap.get(id) ?? null;
    return data.find((p) => p.id === id) ?? null;
  }
  async getByName(name: string): Promise<PokemonFull | null> {
    const q = normalizeQuery(name);
    if (!q) return null;
    await loadFullDataset();
    if (nameMap) return nameMap.get(q) ?? null;
    return fullDataCache?.find((p) => p.name.toLowerCase() === q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<PokemonFull | null> {
    const q = normalizeQuery(nameEs);
    if (!q) return null;
    await loadFullDataset();
    if (nameEsMap) return nameEsMap.get(q) ?? nameMap?.get(q) ?? null;
    return (
      fullDataCache?.find(
        (p) =>
          (p.nameEs && String(p.nameEs).toLowerCase() === q) ||
          p.name.toLowerCase() === q,
      ) ?? null
    );
  }
  async search(query: string): Promise<PokemonFull[]> {
    const q = normalizeQuery(query);
    const data = await loadFullDataset();
    if (!q) return data;
    return data.filter((p) => {
      const name = p.name.toLowerCase();
      const nameEs = String(p.nameEs ?? "").toLowerCase();
      const types = (p.types ?? []).join(" ").toLowerCase();
      return name.includes(q) || nameEs.includes(q) || types.includes(q);
    });
  }
  async searchOptimized(query: string): Promise<OptimizedPokemon[]> {
    const q = normalizeQuery(query);
    const data = await loadOptimizedDataset();
    if (!q) return data;
    return data.filter((p) => {
      const name = p.name.toLowerCase();
      const nameEs = String(p.nameEs ?? "").toLowerCase();
      const types = (p.types ?? []).join(" ").toLowerCase();
      return name.includes(q) || nameEs.includes(q) || types.includes(q);
    });
  }
  async getByType(type: string): Promise<PokemonFull[]> {
    const q = normalizeQuery(type);
    if (!q) return [];
    const data = await loadFullDataset();
    return data.filter((p) =>
      (p.types ?? []).some((t) => String(t).toLowerCase() === q),
    );
  }
  async getCustomForms(): Promise<CustomForm[]> {
    return loadCustomForms();
  }
  async getByBstRange(min: number, max: number): Promise<OptimizedPokemon[]> {
    const data = await loadOptimizedDataset();
    return data.filter((p) => {
      const bst = p.bst ?? 0;
      return bst >= min && bst <= max;
    });
  }
  async getBaseDataById(id: number) {
    const p = await this.getById(id);
    if (!p) return null;
    return { id: p.id, name: p.name, baseStats: p.baseStats };
  }
}
