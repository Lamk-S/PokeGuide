import { create } from "zustand";
import { itemRepository } from "@/infrastructure/composition/battle.composition";
import type { Item } from "@/domain/items/types/item";

interface ItemStore {
  itemList: Item[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  itemList: [],
  isLoading: false,
  loadItems: async () => {
    if (get().itemList.length > 0 || get().isLoading) return;
    set({ isLoading: true });
    try {
      const list = await itemRepository.getAll();
      set({ itemList: list, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
