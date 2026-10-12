"use client";
import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
interface State {
  pokemonList: Pokemon[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  loadPokemon: () => Promise<void>;
}
export const usePokedexStore = create<State>((set) => ({
  pokemonList: [],
  loading: false,
  isLoading: false,
  error: null,
  loadPokemon: async () => {
    set({ loading: true, isLoading: true, error: null });
    try {
      await container.pokemon.init();
      const list = (await container.pokemon.getAll()) as unknown as Pokemon[];
      set({ pokemonList: list, loading: false, isLoading: false });
    } catch (e) {
      set({
        loading: false,
        isLoading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  },
}));
