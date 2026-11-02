import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type Item = {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  id?: string;
  [k: string]: unknown;
};

let cache: Item[] | null = null;
let promise: Promise<Item[]> | null = null;
let nameMap: Map<string, Item> | null = null;
let idMap: Map<string, Item> | null = null;

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
    cache = data.map((it) => ({
      ...it,
      name: normalizeId(String(it.name)),
      id: it.id ? normalizeId(String(it.id)) : normalizeId(String(it.name)),
      nameEs: String(it.nameEs ?? it.name),
    }));
    nameMap = new Map();
    idMap = new Map();
    for (const it of cache) {
      const n = normalizeId(it.name);
      const es = normalizeId(String(it.nameEs ?? ""));
      const id = it.id ? normalizeId(it.id) : n;
      nameMap.set(n, it);
      if (es) nameMap.set(es, it);
      if (id) {
        nameMap.set(id, it);
        idMap.set(id, it);
      }
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
    const q = normalizeId(name.trim());
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Item | null> {
    return this.getByName(nameEs);
  }
  async getById(id: string): Promise<Item | null> {
    const q = normalizeId(id.trim());
    if (!q) return null;
    await loadDataset();
    return idMap?.get(q) ?? nameMap?.get(q) ?? null;
  }
  async search(query: string): Promise<Item[]> {
    const q = normalizeId(query.trim());
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((it) => {
      const n = normalizeId(it.name);
      const es = normalizeId(String(it.nameEs ?? ""));
      const id = it.id ? normalizeId(it.id) : "";
      return n.includes(q) || es.includes(q) || id.includes(q);
    });
  }
  async getCompetitive(): Promise<Item[]> {
    const data = await loadDataset();
    try {
      const { COMPETITIVE_ITEM_NAMES } = await import(
        "@/domain/items/constants/competitiveItems"
      );
      const filtered = data.filter((it) => {
        const cand = it.id ? normalizeId(it.id) : normalizeId(it.name);
        return (
          COMPETITIVE_ITEM_NAMES.has(cand) ||
          COMPETITIVE_ITEM_NAMES.has(normalizeId(it.name))
        );
      });
      if (filtered.length >= 5) return filtered;
    } catch {}
    try {
      const wlMod = await import("../../../../data/items/whitelist.json");
      const whitelist = extractDefault<string[]>(wlMod);
      const set = new Set(whitelist.map((s) => normalizeId(s)));
      const filtered = data.filter((it) => set.has(normalizeId(it.name)));
      return filtered.length >= 5 ? filtered : data;
    } catch {
      return data;
    }
  }
  getByNameSync(name: string): Item | null {
    const q = normalizeId(name.trim());
    if (!q || !nameMap) return null;
    return nameMap.get(q) ?? null;
  }
  existsSync(name: string): boolean {
    return this.getByNameSync(name) !== null;
  }
}
