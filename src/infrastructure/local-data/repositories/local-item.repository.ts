import type { Item } from "@/domain/items/types/item";
import dataset from "../../../../data/items/dataset.json";

export class LocalItemRepository {
  private items = dataset as Item[];
  getAll = async (): Promise<Item[]> => this.items;
}
