import { COMPETITIVE_ITEMS } from "@/features/battle/constants/competitiveItems";
import rawItemsData from "../../../../data/items/dataset.es.json";

type RawItem = {
  id?: string;
  name: string;
  nameEs?: string;
  description?: string;
  descriptionEs?: string;
  effect?: string;
  effectEs?: string;
  category?: string;
};

function parseDataset(data: unknown): RawItem[] {
  if (Array.isArray(data)) return data as RawItem[];
  if (data && typeof data === "object" && "items" in data) {
    const obj = data as { items: unknown };
    if (Array.isArray(obj.items)) return obj.items as RawItem[];
  }
  return [];
}

export class LocalItemRepository {
  private items: RawItem[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const fromJson = parseDataset(rawItemsData as unknown);
    if (fromJson.length > 0) {
      this.items = fromJson;
    } else {
      this.items = [...(COMPETITIVE_ITEMS as unknown as RawItem[])];
    }
    if (this.items.length < 50) {
      const existing = new Set(this.items.map((i) => i.name.toLowerCase()));
      for (const comp of COMPETITIVE_ITEMS as unknown as RawItem[]) {
        if (!existing.has(comp.name.toLowerCase())) {
          this.items.push(comp);
        }
      }
    }
    this.initialized = true;
  }

  async getAll(): Promise<RawItem[]> {
    await this.init();
    return this.items;
  }

  async getCompetitive(): Promise<RawItem[]> {
    await this.init();
    return COMPETITIVE_ITEMS as unknown as RawItem[];
  }

  async getAllItems(): Promise<RawItem[]> {
    return this.getAll();
  }

  async getCompetitiveItems(): Promise<RawItem[]> {
    return this.getCompetitive();
  }

  async getByName(name: string): Promise<RawItem | null> {
    await this.init();
    const norm = name.toLowerCase().replace(/_/g, "-").trim();
    return (
      this.items.find(
        (i) =>
          i.name.toLowerCase() === norm ||
          i.nameEs?.toLowerCase() === norm ||
          i.id?.toLowerCase() === norm,
      ) || null
    );
  }

  async getById(id: string): Promise<RawItem | null> {
    return this.getByName(id);
  }

  get itemList(): RawItem[] {
    return this.items;
  }
}
