type Item = {
  name: string;
  nameEs?: string;
  effect?: string;
  [k: string]: unknown;
};
let cache: Item[] | null = null;
let promise: Promise<Item[]> | null = null;
let nameMap: Map<string, Item> | null = null;

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

async function loadDataset(): Promise<Item[]> {
  if (cache) return cache;
  if (promise) return promise;
  promise = (async () => {
    const mod = await import("../../../../data/items/dataset.es.json");
    const data = extractDefault<Item[]>(mod);
    cache = data;
    nameMap = new Map();
    for (const it of cache) {
      nameMap.set(it.name.toLowerCase(), it);
      if (it.nameEs) nameMap.set(String(it.nameEs).toLowerCase(), it);
    }
    return cache;
  })();
  return promise;
}

export class LocalItemRepository {
  async init(): Promise<void> {
    await loadDataset();
  }
  async getAll(): Promise<Item[]> {
    return loadDataset();
  }
  async getByName(name: string): Promise<Item | null> {
    const q = name.trim().toLowerCase();
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Item | null> {
    return this.getByName(nameEs);
  }
  async search(query: string): Promise<Item[]> {
    const q = query.trim().toLowerCase();
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((it) => {
      const n = it.name.toLowerCase();
      const es = String(it.nameEs ?? "").toLowerCase();
      return n.includes(q) || es.includes(q);
    });
  }
  async getCompetitive(): Promise<Item[]> {
    const data = await loadDataset();
    try {
      const wlMod = await import("../../../../data/items/whitelist.json");
      const whitelist = extractDefault<string[]>(wlMod);
      const set = new Set(whitelist.map((s) => s.toLowerCase()));
      const filtered = data.filter((it) => set.has(it.name.toLowerCase()));
      return filtered.length >= 5 ? filtered : data;
    } catch {
      return data;
    }
  }
}
