import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export interface MoveDTO {
  readonly id: string;
  readonly name: string;
  readonly nameEs: string;
  readonly type: PokemonType;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly damageCategory: "physical" | "special" | "status";
  readonly effect?: string;
  readonly description?: string;
}

type RawMove = Partial<MoveDTO> & {
  readonly id: string;
  readonly name?: string;
  readonly nameEs?: string;
  readonly type?: PokemonType | string;
  readonly power?: number | null;
  readonly accuracy?: number | null;
  readonly damageCategory?: MoveDTO["damageCategory"] | string;
  readonly category?: string;
  readonly effect?: string;
  readonly description?: string;
};

let cache: readonly MoveDTO[] | null = null;
let byIdCache: ReadonlyMap<string, MoveDTO> | null = null;
let byNameCache: ReadonlyMap<string, MoveDTO> | null = null;

function getRawMovesArray(mod: unknown): RawMove[] {
  const data = (mod as { default?: unknown }).default ?? mod;
  if (Array.isArray(data)) return data as RawMove[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.moves)) return obj.moves as RawMove[];
    if (Array.isArray(obj.data)) return obj.data as RawMove[];
  }
  return [];
}

function normalizeCategory(cat: unknown): MoveDTO["damageCategory"] {
  const s = String(cat ?? "status").toLowerCase();
  if (s.includes("phys")) return "physical";
  if (s.includes("spec")) return "special";
  return "status";
}

async function loadInternal(): Promise<readonly MoveDTO[]> {
  if (cache && byIdCache && byNameCache) return cache;
  let raw: RawMove[] = [];
  try {
    const mod = await import("@/../data/moves/dataset.es.json");
    raw = getRawMovesArray(mod);
  } catch {
    try {
      const mod2 = await import("@/../data/moves/dataset.es.json");
      raw = getRawMovesArray(mod2);
    } catch {
      raw = [];
    }
  }

  if (raw.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[LocalMoveRepository] No se pudo cargar dataset.es.json de movimientos, usando fallback mínimo",
      );
    }
    raw = [
      {
        id: "tackle",
        name: "tackle",
        nameEs: "Placaje",
        type: "normal" as PokemonType,
        power: 40,
        accuracy: 100,
        damageCategory: "physical",
      },
    ];
  }

  const normalized: MoveDTO[] = raw.map((m) =>
    Object.freeze({
      id: String(m.id).toLowerCase(),
      name: String(m.name ?? m.id).toLowerCase(),
      nameEs: String(m.nameEs ?? m.name ?? m.id),
      type:
        (String(m.type ?? "normal").toLowerCase() as PokemonType) ??
        ("normal" as PokemonType),
      power: typeof m.power === "number" ? m.power : null,
      accuracy: typeof m.accuracy === "number" ? m.accuracy : null,
      damageCategory: normalizeCategory(m.damageCategory ?? m.category),
      effect: m.effect ? String(m.effect) : undefined,
      description: m.description ? String(m.description) : undefined,
    }),
  );

  cache = Object.freeze(normalized);
  byIdCache = new Map(cache.map((mm) => [mm.id, mm]));
  byNameCache = new Map(cache.map((mm) => [mm.name.toLowerCase(), mm]));
  for (const mm of cache) {
    if (!byNameCache.has(mm.nameEs.toLowerCase())) {
      (byNameCache as Map<string, MoveDTO>).set(mm.nameEs.toLowerCase(), mm);
    }
  }
  return cache;
}

export class LocalMoveRepository {
  static async getAll(): Promise<readonly MoveDTO[]> {
    return loadInternal();
  }
  static async getById(id: string): Promise<MoveDTO | null> {
    await loadInternal();
    const key = id.toLowerCase().trim();
    return byIdCache?.get(key) ?? byNameCache?.get(key) ?? null;
  }
  static async getByName(name: string): Promise<MoveDTO | null> {
    await loadInternal();
    const key = name.toLowerCase().trim();
    return byIdCache?.get(key) ?? byNameCache?.get(key) ?? null;
  }
  static async getByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, MoveDTO>> {
    await loadInternal();
    const result = new Map<string, MoveDTO>();
    if (!byIdCache) return result;
    for (const rawId of ids) {
      if (!rawId) continue;
      const key = String(rawId).toLowerCase().trim();
      const found = byIdCache.get(key) ?? byNameCache?.get(key);
      if (found) result.set(key, found);
    }
    return result;
  }
  static async search(query: string): Promise<readonly MoveDTO[]> {
    const all = await loadInternal();
    const q = query.toLowerCase().trim();
    if (!q) return all;
    return all.filter(
      (mm) =>
        mm.id.includes(q) ||
        mm.name.toLowerCase().includes(q) ||
        mm.nameEs.toLowerCase().includes(q) ||
        String(mm.type).toLowerCase().includes(q),
    );
  }
  static async init(): Promise<void> {
    await loadInternal();
  }
  static _clearCache(): void {
    cache = null;
    byIdCache = null;
    byNameCache = null;
  }

  async getAll(): Promise<readonly MoveDTO[]> {
    return LocalMoveRepository.getAll();
  }
  async getById(id: string): Promise<MoveDTO | null> {
    return LocalMoveRepository.getById(id);
  }
  async getByName(name: string): Promise<MoveDTO | null> {
    return LocalMoveRepository.getByName(name);
  }
  async getByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, MoveDTO>> {
    return LocalMoveRepository.getByIds(ids);
  }
  async search(query: string): Promise<readonly MoveDTO[]> {
    return LocalMoveRepository.search(query);
  }
  async init(): Promise<void> {
    await LocalMoveRepository.init();
  }
  _clearCache(): void {
    LocalMoveRepository._clearCache();
  }
}
