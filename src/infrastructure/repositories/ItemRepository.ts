import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface ItemData {
  readonly id: string;
  readonly name: string;
  readonly nameEs: string;
  readonly description: string;
  readonly category: string;
  readonly effect?: string;
  readonly isChoice: boolean;
  readonly isBerry: boolean;
  readonly isHeavyDutyBoots: boolean;
}

export interface IItemRepository {
  getById(id: string): Promise<ItemData | null>;
  getByName(name: string): Promise<ItemData | null>;
  validate(idOrName: string): Promise<boolean>;
  getAll(): Promise<ItemData[]>;
}

type RawItem = {
  id?: string;
  name: string;
  nameEs?: string;
  description?: string;
  descriptionEs?: string;
  category?: string;
  effect?: string;
};

function extractDefault<T>(mod: unknown): T {
  const withDefault = mod as { default?: T };
  return withDefault.default ?? (mod as T);
}

let cache: ItemData[] | null = null;
let nameMap: Map<string, ItemData> | null = null;

async function loadDataset(): Promise<ItemData[]> {
  if (cache) return cache;
  try {
    const mod = await import("../../../data/items/dataset.es.json");
    const raw = extractDefault<RawItem[]>(mod);
    cache = raw.map((it) => {
      const id = normalizeId(it.id ?? it.name);
      return {
        id,
        name: normalizeId(it.name),
        nameEs: String(it.nameEs ?? it.name),
        description: String(it.descriptionEs ?? it.description ?? ""),
        category: String(it.category ?? "unknown"),
        effect: it.effect,
        isChoice: ["choice-band", "choice-specs", "choice-scarf"].includes(id),
        isBerry: id.includes("berry") || id.includes("baya"),
        isHeavyDutyBoots:
          id === "heavy-duty-boots" || id.includes("botas-gruesas"),
      } as ItemData;
    });
  } catch {
    cache = [
      {
        id: "choice-band",
        name: "choice-band",
        nameEs: "Cinta Elegida",
        description: "Aumenta Ataque x1.5 pero bloquea movimiento",
        category: "choice",
        isChoice: true,
        isBerry: false,
        isHeavyDutyBoots: false,
      },
      {
        id: "choice-specs",
        name: "choice-specs",
        nameEs: "Gafas Elegidas",
        description: "Aumenta At Esp x1.5 pero bloquea movimiento",
        category: "choice",
        isChoice: true,
        isBerry: false,
        isHeavyDutyBoots: false,
      },
      {
        id: "choice-scarf",
        name: "choice-scarf",
        nameEs: "Pañuelo Elegido",
        description: "Aumenta Velocidad x1.5 pero bloquea movimiento",
        category: "choice",
        isChoice: true,
        isBerry: false,
        isHeavyDutyBoots: false,
      },
      {
        id: "heavy-duty-boots",
        name: "heavy-duty-boots",
        nameEs: "Botas Gruesas",
        description: "Evita daño de hazards",
        category: "boots",
        isChoice: false,
        isBerry: false,
        isHeavyDutyBoots: true,
      },
      {
        id: "leftovers",
        name: "leftovers",
        nameEs: "Restos",
        description: "Recupera PS cada turno",
        category: "healing",
        isChoice: false,
        isBerry: false,
        isHeavyDutyBoots: false,
      },
    ] as ItemData[];
  }
  nameMap = new Map();
  for (const it of cache) {
    nameMap.set(it.id, it);
    nameMap.set(it.name, it);
    nameMap.set(normalizeId(it.nameEs), it);
  }
  return cache;
}

export class InMemoryItemRepository implements IItemRepository {
  async getById(id: string): Promise<ItemData | null> {
    const q = normalizeId(id);
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }

  async getByName(name: string): Promise<ItemData | null> {
    const q = normalizeId(name);
    if (!q) return null;
    await loadDataset();
    return nameMap?.get(q) ?? null;
  }

  async validate(idOrName: string): Promise<boolean> {
    const q = normalizeId(idOrName);
    if (!q) return false;
    await loadDataset();
    return nameMap?.has(q) ?? false;
  }

  async getAll(): Promise<ItemData[]> {
    return loadDataset();
  }
}

export const ItemRepository = new InMemoryItemRepository();
