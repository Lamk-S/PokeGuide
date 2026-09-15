import { create } from "zustand";
import { abilityRepository } from "@/infrastructure/composition/battle.composition";
import type { Ability } from "@/domain/abilities/types/ability";

interface AbilityStore {
  abilityList: Ability[];
  isLoading: boolean;
  loadAbilities: () => Promise<void>;
}

export const useAbilityStore = create<AbilityStore>((set, get) => ({
  abilityList: [],
  isLoading: false,
  loadAbilities: async () => {
    if (get().abilityList.length > 0 || get().isLoading) return;
    set({ isLoading: true });
    try {
      const list = await abilityRepository.getAll();
      set({ abilityList: list, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
