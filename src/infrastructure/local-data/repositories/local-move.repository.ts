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
    const values = Object.values(obj);
    if (
      values.length > 0 &&
      values.every((v) => typeof v === "object" && v !== null)
    ) {
      const looksLikeMove = values.some((v) => {
        const o = v as Record<string, unknown>;
        return "id" in o || "name" in o || "type" in o;
      });
      if (looksLikeMove) {
        return Object.entries(obj).map(([k, v]) => {
          const o = v as Record<string, unknown>;
          return {
            id: typeof o.id === "string" ? (o.id as string) : k,
            name: typeof o.name === "string" ? (o.name as string) : k,
            nameEs:
              typeof o.nameEs === "string" ? (o.nameEs as string) : undefined,
            type: o.type as string,
            power: o.power as number | null,
            accuracy: o.accuracy as number | null,
            damageCategory: (o.damageCategory ?? o.category) as string,
            effect: o.effect as string,
            description: o.description as string,
          } as RawMove;
        });
      }
    }
  }

  return [];
}

function normalizeCategory(cat: unknown): MoveDTO["damageCategory"] {
  const s = String(cat ?? "status").toLowerCase();
  if (s.includes("phys") || s.includes("fís") || s.includes("fis"))
    return "physical";
  if (s.includes("spec") || s.includes("especial")) return "special";
  return "status";
}

async function tryImportMoves(): Promise<RawMove[]> {
  const loaders: Array<() => Promise<unknown>> = [
    () => import("@/../data/moves/dataset.es.json"),
    () => import("../../../../data/moves/dataset.es.json"),
  ];

  for (const loader of loaders) {
    try {
      const mod = await loader();
      const arr = getRawMovesArray(mod);
      if (arr.length > 0) return arr;
    } catch {}
  }
  return [];
}

async function loadInternal(): Promise<readonly MoveDTO[]> {
  if (cache && byIdCache && byNameCache) return cache;

  let raw = await tryImportMoves();

  if (raw.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[LocalMoveRepository] dataset.es.json no encontrado, usando fallback mínimo",
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
      {
        id: "flamethrower",
        name: "flamethrower",
        nameEs: "Lanzallamas",
        type: "fire" as PokemonType,
        power: 90,
        accuracy: 100,
        damageCategory: "special",
      },
      {
        id: "air-slash",
        name: "air-slash",
        nameEs: "Tajo Aéreo",
        type: "flying" as PokemonType,
        power: 75,
        accuracy: 95,
        damageCategory: "special",
      },
      {
        id: "dragon-claw",
        name: "dragon-claw",
        nameEs: "Garra Dragón",
        type: "dragon" as PokemonType,
        power: 80,
        accuracy: 100,
        damageCategory: "physical",
      },
    ];
  }

  const normalized: MoveDTO[] = raw.map((m) =>
    Object.freeze({
      id: String(m.id).toLowerCase().replace(/\s+/g, "-"),
      name: String(m.name ?? m.id)
        .toLowerCase()
        .trim(),
      nameEs: String(m.nameEs ?? m.name ?? m.id).trim(),
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
  const idMap = new Map<string, MoveDTO>();
  const nameMap = new Map<string, MoveDTO>();

  for (const mm of cache) {
    idMap.set(mm.id, mm);
    nameMap.set(mm.name.toLowerCase(), mm);
    nameMap.set(mm.nameEs.toLowerCase(), mm);
    nameMap.set(mm.name.toLowerCase().replace(/-/g, " "), mm);
    nameMap.set(mm.nameEs.toLowerCase().replace(/-/g, " "), mm);
  }

  byIdCache = idMap;
  byNameCache = nameMap;

  return cache;
}

export class LocalMoveRepository {
  static async getAll(): Promise<readonly MoveDTO[]> {
    return loadInternal();
  }
  static async getById(id: string): Promise<MoveDTO | null> {
    await loadInternal();
    const key = id.toLowerCase().trim().replace(/\s+/g, "-");
    return (
      byIdCache?.get(key) ??
      byNameCache?.get(key) ??
      byNameCache?.get(id.toLowerCase().trim()) ??
      null
    );
  }
  static async getByName(name: string): Promise<MoveDTO | null> {
    await loadInternal();
    const key = name.toLowerCase().trim();
    return (
      byIdCache?.get(key) ??
      byNameCache?.get(key) ??
      byIdCache?.get(key.replace(/\s+/g, "-")) ??
      null
    );
  }
  static async getByIds(
    ids: readonly string[],
  ): Promise<ReadonlyMap<string, MoveDTO>> {
    await loadInternal();
    const result = new Map<string, MoveDTO>();
    if (!byIdCache) return result;
    for (const rawId of ids) {
      if (!rawId) continue;
      const key = String(rawId).toLowerCase().trim().replace(/\s+/g, "-");
      const found =
        byIdCache.get(key) ??
        byNameCache?.get(key) ??
        byNameCache?.get(String(rawId).toLowerCase().trim());
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
        mm.nameEs.toLowerCase().includes(q),
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
    return LocalMoveRepository.init();
  }
  _clearCache(): void {
    LocalMoveRepository._clearCache();
  }
}
