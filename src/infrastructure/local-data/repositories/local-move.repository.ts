type Move = {
  name: string;
  nameEs?: string;
  type: string;
  power?: number | null;
  [k: string]: unknown;
};
let cache: Move[] | null = null;
let promise: Promise<Move[]> | null = null;
let nameMap: Map<string, Move> | null = null;
let groupedCache: Record<string, Move[]> | null = null;

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

async function loadDataset(): Promise<Move[]> {
  if (cache) return cache;
  if (promise) return promise;
  promise = (async () => {
    const mod = await import("../../../../data/moves/dataset.es.json");
    const data = extractDefault<Move[]>(mod);
    cache = data;
    nameMap = new Map();
    groupedCache = {};
    for (const mv of cache) {
      nameMap.set(mv.name.toLowerCase(), mv);
      if (mv.nameEs) nameMap.set(String(mv.nameEs).toLowerCase(), mv);
      const key = mv.type ?? "unknown";
      if (!groupedCache[key]) groupedCache[key] = [];
      groupedCache[key].push(mv);
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
    const q = name.trim().toLowerCase();
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }
  async getByNameEs(nameEs: string): Promise<Move | null> {
    return this.getByName(nameEs);
  }
  async getGroupedByType(): Promise<Record<string, Move[]>> {
    await loadDataset();
    return groupedCache ?? {};
  }
  async search(query: string): Promise<Move[]> {
    const q = query.trim().toLowerCase();
    const data = await loadDataset();
    if (!q) return data;
    return data.filter((mv) => {
      const n = mv.name.toLowerCase();
      const es = String(mv.nameEs ?? "").toLowerCase();
      const t = String(mv.type ?? "").toLowerCase();
      return n.includes(q) || es.includes(q) || t.includes(q);
    });
  }
  async getByType(type: string): Promise<Move[]> {
    const q = type.trim().toLowerCase();
    if (!q) return [];
    const grouped = await this.getGroupedByType();
    return grouped[q] ?? [];
  }
}
