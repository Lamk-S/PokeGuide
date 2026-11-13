import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export interface MoveDTO {
  readonly id: string;
  readonly name: string;
  readonly nameEs: string;
  readonly type: PokemonType;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly damageCategory: "physical" | "special" | "status";
}

type RawMove = Partial<MoveDTO> & {
  id: string;
  name?: string;
  nameEs?: string;
  type?: PokemonType;
  power?: number | null;
  accuracy?: number | null;
  damageCategory?: MoveDTO["damageCategory"];
};

let cache: readonly MoveDTO[] | null = null;
let byIdCache: ReadonlyMap<string, MoveDTO> | null = null;
let byNameCache: ReadonlyMap<string, MoveDTO> | null = null;

async function loadInternal(): Promise<readonly MoveDTO[]> {
  if (cache && byIdCache && byNameCache) return cache;
  let raw: RawMove[] = [];
  try {
    const mod = await import("@/../data/moves/dataset.es.json");
    const data = (mod.default ?? mod) as unknown as
      | { moves?: RawMove[] }
      | RawMove[];
    if (Array.isArray(data)) raw = data;
    else if (
      data &&
      typeof data === "object" &&
      "moves" in data &&
      Array.isArray((data as { moves: RawMove[] }).moves)
    )
      raw = (data as { moves: RawMove[] }).moves;
  } catch {
    raw = [
      {
        id: "earthquake",
        name: "earthquake",
        nameEs: "Terremoto",
        type: "ground" as PokemonType,
        power: 100,
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
      type: (m.type ?? "normal") as PokemonType,
      power: m.power ?? null,
      accuracy: m.accuracy ?? null,
      damageCategory: (m.damageCategory ??
        "status") as MoveDTO["damageCategory"],
    }),
  );
  cache = Object.freeze(normalized);
  byIdCache = new Map(cache.map((mm) => [mm.id, mm]));
  byNameCache = new Map(cache.map((mm) => [mm.name.toLowerCase(), mm]));
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
