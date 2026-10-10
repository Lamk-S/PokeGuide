import type { Item } from "@/domain/items/types/item";
import datasetEs from "../../../../data/items/dataset.es.json";

type ItemWithEs = Item & {
  nameEs?: string;
  category?: string;
  effectEs?: string;
  sprite?: string | null;
};

export class LocalItemRepository {
  private readonly items: ItemWithEs[];
  private readonly byName: Map<string, ItemWithEs>;

  constructor() {
    this.items = datasetEs as ItemWithEs[];
    this.byName = new Map(this.items.map((i) => [i.name.toLowerCase(), i]));
  }

  async getAll(): Promise<ItemWithEs[]> {
    return [...this.items];
  }

  async getByName(name: string): Promise<ItemWithEs | null> {
    return this.byName.get(name.toLowerCase().trim()) ?? null;
  }

  async getByNameEs(nameEs: string): Promise<ItemWithEs | null> {
    const normalized = nameEs.toLowerCase().trim();
    return (
      this.items.find((i) => i.nameEs?.toLowerCase() === normalized) ?? null
    );
  }

  async search(query: string): Promise<ItemWithEs[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...this.items];
    return this.items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.nameEs?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q),
    );
  }

  async getByCategory(category: string): Promise<ItemWithEs[]> {
    const c = category.toLowerCase().trim();
    return this.items.filter((i) => i.category?.toLowerCase() === c);
  }
}
