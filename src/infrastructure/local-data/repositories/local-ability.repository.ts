import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type Ability = {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  id?: string;
  [k: string]: unknown;
};

let cache: Ability[] | null = null;
let promise: Promise<Ability[]> | null = null;
let nameMap: Map<string, Ability> | null = null;
let idMap: Map<string, Ability> | null = null;

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
    cache = data.map((ab) => ({
      ...ab,
      name: normalizeId(String(ab.name)),
      id: ab.id ? normalizeId(String(ab.id)) : normalizeId(String(ab.name)),
      nameEs: String(ab.nameEs ?? ab.name),
    }));
    nameMap = new Map();
    idMap = new Map();
    for (const ab of cache) {
      const n = normalizeId(ab.name);
      const es = normalizeId(String(ab.nameEs ?? ""));
      const id = ab.id ? normalizeId(ab.id) : n;
      nameMap.set(n, ab);
      if (es) nameMap.set(es, ab);
      if (id) {
        nameMap.set(id, ab);
        idMap.set(id, ab);
      }
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
    const q = normalizeId(name.trim());
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Ability | null> {
    return this.getByName(nameEs);
  }
  async getById(id: string): Promise<Ability | null> {
    const q = normalizeId(id.trim());
    if (!q) return null;
    await loadDataset();
    return idMap?.get(q) ?? nameMap?.get(q) ?? null;
  }
  async search(query: string): Promise<Ability[]> {
    const q = normalizeId(query.trim());
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((a) => {
      const n = normalizeId(a.name);
      const es = normalizeId(String(a.nameEs ?? ""));
      const id = a.id ? normalizeId(a.id) : "";
      return n.includes(q) || es.includes(q) || id.includes(q);
    });
  }
  async getCompetitive(): Promise<Ability[]> {
    const data = await loadDataset();
    try {
      const { VALID_ABILITY_IDS } = await import(
        "@/domain/abilities/constants/competitiveAbilities"
      );
      const filtered = data.filter((ab) =>
        VALID_ABILITY_IDS.has(normalizeId(ab.name)),
      );
      return filtered.length >= 5 ? filtered : data;
    } catch {
      return data;
    }
  }
  getByNameSync(name: string): Ability | null {
    const q = normalizeId(name.trim());
    if (!q || !nameMap) return null;
    return nameMap.get(q) ?? null;
  }
  existsSync(name: string): boolean {
    return this.getByNameSync(name) !== null;
  }
}
