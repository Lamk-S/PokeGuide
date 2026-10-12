type Ability = {
  name: string;
  nameEs?: string;
  effect?: string;
  [k: string]: unknown;
};
let cache: Ability[] | null = null;
let promise: Promise<Ability[]> | null = null;
let nameMap: Map<string, Ability> | null = null;

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

async function loadDataset(): Promise<Ability[]> {
  if (cache) return cache;
  if (promise) return promise;
  promise = (async () => {
    const mod = await import("../../../../data/abilities/dataset.es.json");
    const data = extractDefault<Ability[]>(mod);
    cache = data;
    nameMap = new Map();
    for (const ab of cache) {
      nameMap.set(ab.name.toLowerCase(), ab);
      if (ab.nameEs) nameMap.set(String(ab.nameEs).toLowerCase(), ab);
    }
    return cache;
  })();
  return promise;
}

export class LocalAbilityRepository {
  async init(): Promise<void> {
    await loadDataset();
  }
  async getAll(): Promise<Ability[]> {
    return loadDataset();
  }
  async getByName(name: string): Promise<Ability | null> {
    const q = name.trim().toLowerCase();
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Ability | null> {
    return this.getByName(nameEs);
  }
  async search(query: string): Promise<Ability[]> {
    const q = query.trim().toLowerCase();
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((a) => {
      const n = a.name.toLowerCase();
      const es = String(a.nameEs ?? "").toLowerCase();
      return n.includes(q) || es.includes(q);
    });
  }
}
