"use client";
import { create } from "zustand";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";

type Item = {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  id?: string;
};

interface State {
  itemList: Item[];
  competitiveList: Item[];
  loading: boolean;
  loadItems: () => Promise<void>;
}

const repo = new LocalItemRepository();

export const useItemStore = create<State>((set) => ({
  itemList: [],
  competitiveList: [],
  loading: false,
  loadItems: async () => {
    set({ loading: true });
    await repo.init();
    const all = (await repo.getAll()) as unknown as Item[];
    let comp: Item[] = [];
    try {
      comp = (await repo.getCompetitive()) as unknown as Item[];
    } catch {
      comp = all;
    }
    set({ itemList: all, competitiveList: comp, loading: false });
  },
}));
