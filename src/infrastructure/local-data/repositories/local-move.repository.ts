import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type Move = {
  id?: number;
  name: string;
  nameEs?: string;
  type: string;
  power?: number | null;
  accuracy?: number | null;
  pp?: number;
  priority?: number;
  damageClass?: "physical" | "special" | "status" | string;
  effect?: string;
  shortEffect?: string;
  effectEs?: string;
  shortEffectEs?: string;
  [k: string]: unknown;
};

let cache: Move[] | null = null;
let promise: Promise<Move[]> | null = null;
let nameMap: Map<string, Move> | null = null;
let idMap: Map<number, Move> | null = null;
let groupedCache: Record<string, Move[]> | null = null;

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

async function loadDataset(): Promise<Move[]> {
  if (cache) return cache;
  if (promise) return promise;
  promise = (async () => {
    let data: Move[] = [];
    try {
      const mod = await import("../../../../data/moves/dataset.es.json");
      data = extractDefault<Move[]>(mod);
    } catch {
      const mod = await import("../../../../public/data/moves.es.json");
      data = extractDefault<Move[]>(mod);
    }
    cache = data.map((mv) => ({
      ...mv,
      name: normalizeId(String(mv.name)),
      nameEs: String(mv.nameEs ?? mv.name),
      type: normalizeId(String(mv.type ?? "unknown")),
    }));
    nameMap = new Map();
    idMap = new Map();
    groupedCache = {};
    for (const mv of cache) {
      const n = normalizeId(mv.name);
      const es = normalizeId(String(mv.nameEs ?? ""));
      const t = normalizeId(String(mv.type ?? "unknown"));
      nameMap.set(n, mv);
      if (es) nameMap.set(es, mv);
      if (!groupedCache[t]) groupedCache[t] = [];
      groupedCache[t].push(mv);
      if (typeof mv.id === "number") idMap.set(mv.id, mv);
    }
    return cache;
  })();
  return promise;
}

export class LocalMoveRepository {
  async init(): Promise<void> {
    await loadDataset();
  }
  async getAll(): Promise<Move[]> {
    return loadDataset();
  }
  async getByName(name: string): Promise<Move | null> {
    const q = normalizeId(name.trim());
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Move | null> {
    return this.getByName(nameEs);
  }
  async getById(id: number): Promise<Move | null> {
    await loadDataset();
    return idMap?.get(id) ?? null;
  }
  async getGroupedByType(): Promise<Record<string, Move[]>> {
    await loadDataset();
    return groupedCache ?? {};
  }
  async search(query: string): Promise<Move[]> {
    const q = normalizeId(query.trim());
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((mv) => {
      const n = normalizeId(mv.name);
      const es = normalizeId(String(mv.nameEs ?? ""));
      const t = normalizeId(String(mv.type ?? ""));
      return n.includes(q) || es.includes(q) || t.includes(q);
    });
  }
  async getByType(type: string): Promise<Move[]> {
    const q = normalizeId(type.trim());
    if (!q) return [];
    const grouped = await this.getGroupedByType();
    return grouped[q] ?? [];
  }
  getByNameSync(name: string): Move | null {
    const q = normalizeId(name.trim());
    if (!q || !nameMap) return null;
    return nameMap.get(q) ?? null;
  }
  async exists(name: string): Promise<boolean> {
    return (await this.getByName(name)) !== null;
  }
}
