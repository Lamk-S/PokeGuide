import fullDataset from "@/../data/pokemon/dataset.es.json";
import optimizedDataset from "@/../data/pokemon/dataset.optimized.json";

export interface PokemonOptimized {
  readonly id: number;
  readonly name: string;
  readonly types: readonly string[];
  readonly sprite?: string;
  readonly nameEs?: string;
  readonly displayNameEs?: string;
}

export interface PokemonFull {
  readonly id: number;
  readonly name: string;
  readonly nameEs: string;
  readonly displayNameEs: string;
  readonly types: readonly string[];
  readonly bst: number;
  readonly baseStats?: Readonly<Record<string, number>>;
  readonly sprite?: string;
  readonly abilities?: readonly unknown[];
  readonly moves?: readonly unknown[];
  readonly isCustomForm?: boolean;
}

export type OptimizedPokemon = PokemonOptimized;

type RawPokemon = Record<string, unknown> & {
  readonly id?: unknown;
  readonly number?: unknown;
  readonly dex?: unknown;
  readonly name?: unknown;
  readonly slug?: unknown;
  readonly idName?: unknown;
  readonly nameEs?: unknown;
  readonly displayNameEs?: unknown;
  readonly name_es?: unknown;
  readonly spanishName?: unknown;
  readonly species?: unknown;
  readonly types?: unknown;
  readonly type?: unknown;
  readonly sprite?: unknown;
  readonly image?: unknown;
  readonly baseStats?: unknown;
  readonly stats?: unknown;
  readonly base?: unknown;
  readonly bst?: unknown;
  readonly abilities?: unknown;
  readonly moves?: unknown;
  readonly isCustomForm?: unknown;
  readonly isCustom?: unknown;
  readonly custom?: unknown;
  readonly isForm?: unknown;
};

let fullCache: PokemonFull[] | null = null;
let optimizedCache: PokemonOptimized[] | null = null;

function toStringSafe(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toNumberSafe(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") return [v];
  return [];
}

function sumBaseStats(base: unknown): number {
  if (!base || typeof base !== "object") return 0;
  const obj = base as Record<string, unknown>;
  let sum = 0;
  for (const k of [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ]) {
    const val = obj[k];
    if (typeof val === "number") sum += val;
  }
  if (sum === 0) {
    for (const val of Object.values(obj)) {
      if (typeof val === "number") sum += val;
    }
  }
  return sum;
}

function normalizeOptimized(raw: RawPokemon): PokemonOptimized {
  const id = toNumberSafe(raw.id ?? raw.number ?? raw.dex, 0);
  const name = toStringSafe(raw.name ?? raw.slug ?? "");
  const types = toStringArray(raw.types ?? raw.type);
  const sprite = toStringSafe(raw.sprite ?? raw.image ?? "");
  const nameEs = toStringSafe(
    raw.nameEs ?? raw.displayNameEs ?? raw.name_es ?? raw.spanishName ?? name,
  );
  const displayNameEs = toStringSafe(raw.displayNameEs ?? raw.nameEs ?? nameEs);
  return Object.freeze({
    id,
    name,
    types: Object.freeze(
      types.map((t) => String(t).toLowerCase()),
    ) as readonly string[],
    sprite: sprite || undefined,
    nameEs: nameEs || undefined,
    displayNameEs: displayNameEs || undefined,
  });
}

function normalizeFull(raw: RawPokemon): PokemonFull {
  const id = toNumberSafe(raw.id ?? raw.number ?? raw.dex, 0);
  const name = toStringSafe(raw.name ?? raw.slug ?? raw.idName ?? "");
  const nameEsRaw =
    raw.nameEs ??
    raw.displayNameEs ??
    raw.name_es ??
    raw.spanishName ??
    raw.species ??
    name;
  const displayRaw = raw.displayNameEs ?? raw.nameEs ?? nameEsRaw;
  const nameEs = toStringSafe(nameEsRaw);
  const displayNameEs = toStringSafe(displayRaw);
  const types = toStringArray(raw.types ?? raw.type);
  const baseStatsRaw = raw.baseStats ?? raw.stats ?? raw.base ?? null;
  const bstRaw = raw.bst;
  const computedBst =
    typeof bstRaw === "number" ? bstRaw : sumBaseStats(baseStatsRaw);
  const baseStats =
    baseStatsRaw && typeof baseStatsRaw === "object"
      ? (baseStatsRaw as Record<string, number>)
      : undefined;
  const isCustom = Boolean(
    raw.isCustomForm ?? raw.isCustom ?? raw.custom ?? raw.isForm ?? false,
  );

  return Object.freeze({
    id,
    name,
    nameEs: nameEs || name,
    displayNameEs: displayNameEs || nameEs || name,
    types: Object.freeze(
      types.map((t) => String(t).toLowerCase()),
    ) as readonly string[],
    bst: computedBst,
    baseStats: baseStats ? Object.freeze({ ...baseStats }) : undefined,
    sprite: toStringSafe(raw.sprite ?? "") || undefined,
    abilities: Array.isArray(raw.abilities)
      ? (Object.freeze([...(raw.abilities as unknown[])]) as readonly unknown[])
      : undefined,
    moves: Array.isArray(raw.moves)
      ? (Object.freeze([...(raw.moves as unknown[])]) as readonly unknown[])
      : undefined,
    isCustomForm: isCustom || undefined,
  });
}

function getRawArray(mod: unknown): RawPokemon[] {
  const data = (mod as { default?: unknown }).default ?? mod;
  if (Array.isArray(data)) return data as RawPokemon[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.pokemon)) return obj.pokemon as RawPokemon[];
    if (Array.isArray(obj.data)) return obj.data as RawPokemon[];
    if (Array.isArray(obj.pokemons)) return obj.pokemons as RawPokemon[];
  }
  return [];
}

async function loadFullInternal(): Promise<PokemonFull[]> {
  if (fullCache) return fullCache;
  const raws = getRawArray(fullDataset);
  fullCache = raws.map(normalizeFull);
  return fullCache;
}

async function loadOptimizedInternal(): Promise<PokemonOptimized[]> {
  if (optimizedCache) return optimizedCache;
  const raws = getRawArray(optimizedDataset);
  optimizedCache = raws.map(normalizeOptimized);
  return optimizedCache;
}

function matchesQuery(
  p: {
    id: number;
    name: string;
    nameEs: string;
    displayNameEs: string;
    types: readonly string[];
  },
  q: string,
): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(lower) ||
    p.nameEs.toLowerCase().includes(lower) ||
    p.displayNameEs.toLowerCase().includes(lower) ||
    String(p.id).includes(lower) ||
    p.types.some((t) => t.toLowerCase().includes(lower))
  );
}

function matchesOptimized(p: PokemonOptimized, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(lower) ||
    (p.nameEs ?? "").toLowerCase().includes(lower) ||
    (p.displayNameEs ?? "").toLowerCase().includes(lower) ||
    String(p.id).includes(lower) ||
    p.types.some((t) => t.toLowerCase().includes(lower))
  );
}

export class LocalPokemonRepository {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Promise.all([loadFullInternal(), loadOptimizedInternal()]);
    this.initialized = true;
  }

  static async getAllOptimized(): Promise<readonly PokemonOptimized[]> {
    return loadOptimizedInternal();
  }

  static async getAll(): Promise<readonly PokemonFull[]> {
    return loadFullInternal();
  }

  static async getById(id: number): Promise<PokemonFull | null> {
    const all = await loadFullInternal();
    return all.find((p) => p.id === id) ?? null;
  }

  static async getByName(name: string): Promise<PokemonFull | null> {
    const all = await loadFullInternal();
    const norm = name.toLowerCase().trim();
    return (
      all.find(
        (p) =>
          p.name.toLowerCase() === norm ||
          p.displayNameEs.toLowerCase() === norm ||
          p.nameEs.toLowerCase() === norm,
      ) ?? null
    );
  }

  static async getByNameEs(nameEs: string): Promise<PokemonFull | null> {
    const all = await loadFullInternal();
    const norm = nameEs.toLowerCase().trim();
    return (
      all.find(
        (p) =>
          p.nameEs.toLowerCase() === norm ||
          p.displayNameEs.toLowerCase() === norm ||
          p.name.toLowerCase() === norm,
      ) ?? null
    );
  }

  static async getByIds(
    ids: readonly number[],
  ): Promise<readonly PokemonFull[]> {
    const all = await loadFullInternal();
    const set = new Set(ids);
    return all.filter((p) => set.has(p.id));
  }

  static async search(query: string): Promise<readonly PokemonFull[]> {
    const all = await loadFullInternal();
    const q = query.trim();
    if (!q) return all;
    return all.filter((p) => matchesQuery(p, q));
  }

  static async searchOptimized(
    query: string,
  ): Promise<readonly PokemonOptimized[]> {
    const all = await loadOptimizedInternal();
    const q = query.trim();
    if (!q) return all;
    return all.filter((p) => matchesOptimized(p, q));
  }

  static async getByType(type: string): Promise<readonly PokemonFull[]> {
    const all = await loadFullInternal();
    const norm = type.toLowerCase().trim();
    return all.filter((p) =>
      p.types.map((t) => t.toLowerCase()).includes(norm),
    );
  }

  static async getCustomForms(): Promise<readonly PokemonFull[]> {
    const all = await loadFullInternal();
    return all.filter((p) => p.isCustomForm);
  }

  static async getByBstRange(
    min: number,
    max: number,
  ): Promise<readonly PokemonFull[]> {
    const all = await loadFullInternal();
    return all.filter((p) => p.bst >= min && p.bst <= max);
  }

  async getAllOptimized(): Promise<readonly PokemonOptimized[]> {
    return LocalPokemonRepository.getAllOptimized();
  }

  async getAll(): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.getAll();
  }

  async getById(id: number): Promise<PokemonFull | null> {
    return LocalPokemonRepository.getById(id);
  }

  async getByName(name: string): Promise<PokemonFull | null> {
    return LocalPokemonRepository.getByName(name);
  }

  async getByNameEs(nameEs: string): Promise<PokemonFull | null> {
    return LocalPokemonRepository.getByNameEs(nameEs);
  }

  async getByIds(ids: readonly number[]): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.getByIds(ids);
  }

  async search(query: string): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.search(query);
  }

  async searchOptimized(query: string): Promise<readonly PokemonOptimized[]> {
    return LocalPokemonRepository.searchOptimized(query);
  }

  async getByType(type: string): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.getByType(type);
  }

  async getCustomForms(): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.getCustomForms();
  }

  async getByBstRange(
    min: number,
    max: number,
  ): Promise<readonly PokemonFull[]> {
    return LocalPokemonRepository.getByBstRange(min, max);
  }
}
