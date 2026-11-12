import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface MoveData {
  readonly id: string;
  readonly name: string;
  readonly nameEs: string;
  readonly type: PokemonType;
  readonly power: number | null;
  readonly accuracy: number | null;
  readonly pp: number | null;
  readonly category: "physical" | "special" | "status";
  readonly priority: number;
  readonly effect?: string;
}

export interface IMoveRepository {
  getById(id: string): Promise<MoveData | null>;
  getByName(name: string): Promise<MoveData | null>;
  getByNames(names: readonly string[]): Promise<MoveData[]>;
  getAll(): Promise<MoveData[]>;
  getByType(type: PokemonType): Promise<MoveData[]>;
}

type RawMove = {
  id?: string;
  name: string;
  nameEs?: string;
  type: string;
  power?: number | null;
  accuracy?: number | null;
  pp?: number;
  priority?: number;
  damageClass?: string;
  category?: string;
  effect?: string;
};

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

let cache: MoveData[] | null = null;
let nameMap: Map<string, MoveData> | null = null;
let typeMap: Map<string, MoveData[]> | null = null;

function normalizeCategory(
  raw: string | undefined,
): "physical" | "special" | "status" {
  const v = normalizeId(raw ?? "status");
  if (v.includes("physical") || v === "physical") return "physical";
  if (v.includes("special") || v === "special") return "special";
  return "status";
}

async function loadDataset(): Promise<MoveData[]> {
  if (cache) return cache;
  try {
    const mod = await import("../../../data/moves/dataset.es.json");
    const raw = extractDefault<RawMove[]>(mod);
    cache = raw.map((m) => ({
      id: normalizeId(m.id ?? m.name),
      name: normalizeId(m.name),
      nameEs: String(m.nameEs ?? m.name),
      type: normalizeId(m.type) as PokemonType,
      power: m.power ?? null,
      accuracy: m.accuracy ?? null,
      pp: m.pp ?? null,
      category: normalizeCategory(m.category ?? m.damageClass),
      priority: m.priority ?? 0,
      effect: m.effect,
    }));
  } catch {
    try {
      const mod = await import("../../../public/data/moves.es.json");
      const raw = extractDefault<RawMove[]>(mod);
      cache = raw.map((m) => ({
        id: normalizeId(m.id ?? m.name),
        name: normalizeId(m.name),
        nameEs: String(m.nameEs ?? m.name),
        type: normalizeId(m.type) as PokemonType,
        power: m.power ?? null,
        accuracy: m.accuracy ?? null,
        pp: m.pp ?? null,
        category: normalizeCategory(m.category ?? m.damageClass),
        priority: m.priority ?? 0,
        effect: m.effect,
      }));
    } catch {
      cache = [];
    }
  }
  nameMap = new Map();
  typeMap = new Map();
  for (const mv of cache) {
    nameMap.set(mv.id, mv);
    nameMap.set(mv.name, mv);
    nameMap.set(normalizeId(mv.nameEs), mv);
    const t = mv.type;
    if (!typeMap.has(t)) typeMap.set(t, []);
    typeMap.get(t)?.push(mv);
  }
  return cache;
}

export class InMemoryMoveRepository implements IMoveRepository {
  async getById(id: string): Promise<MoveData | null> {
    const q = normalizeId(id);
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }

  async getByName(name: string): Promise<MoveData | null> {
    const q = normalizeId(name);
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }

  async getByNames(names: readonly string[]): Promise<MoveData[]> {
    await loadDataset();
    const result: MoveData[] = [];
    for (const n of names) {
      const mv = nameMap?.get(normalizeId(n));
      if (mv) result.push(mv);
    }
    return result;
  }

  async getAll(): Promise<MoveData[]> {
    return loadDataset();
  }

  async getByType(type: PokemonType): Promise<MoveData[]> {
    await loadDataset();
    return typeMap?.get(type) ?? [];
  }
}

export const MoveRepository = new InMemoryMoveRepository();
