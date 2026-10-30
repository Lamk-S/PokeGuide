"use client";
import { create } from "zustand";
import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";

type Ability = { name: string; nameEs?: string };
interface State {
  abilityList: Ability[];
  loading: boolean;
  loadAbilities: () => Promise<void>;
}
const repo = new LocalAbilityRepository();
export const useAbilityStore = create<State>((set) => ({
  abilityList: [],
  loading: false,
  loadAbilities: async () => {
    set({ loading: true });
    await repo.init();
    const list = (await repo.getAll()) as unknown as Ability[];
    set({ abilityList: list, loading: false });
  },
}));
