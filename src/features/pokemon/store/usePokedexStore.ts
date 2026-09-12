import { create } from "zustand";
import { pokemonRepository } from "@/infrastructure/composition/battle.composition";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";

interface PokedexStore {
  pokemonList: Pokemon[];
  isLoading: boolean;
  error: string | null;
  loadPokemon: () => Promise<void>;
}

export const usePokedexStore = create<PokedexStore>((set, get) => ({
  pokemonList: [],
  isLoading: false,
  error: null,
  loadPokemon: async () => {
    const { pokemonList, isLoading } = get();
    if (pokemonList.length > 0 || isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const list = await pokemonRepository.getAll();
      set({ pokemonList: list, isLoading: false });
    } catch (err) {
      console.error("[PokedexStore]", err);
      set({
        error: "No se pudo cargar el dataset local de Pokémon.",
        isLoading: false,
      });
    }
  },
}));
