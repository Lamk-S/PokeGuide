"use client";
import { create } from "zustand";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";

type Item = {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
};
interface State {
  itemList: Item[];
  loading: boolean;
  loadItems: () => Promise<void>;
}
const repo = new LocalItemRepository();
export const useItemStore = create<State>((set) => ({
  itemList: [],
  loading: false,
  loadItems: async () => {
    set({ loading: true });
    await repo.init();
    const list = (await repo.getCompetitive()) as unknown as Item[];
    set({ itemList: list, loading: false });
  },
}));
