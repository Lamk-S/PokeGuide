import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";

interface PokedexStore {
  pokemons: Pokemon[];
  pokemonList: Pokemon[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  loadPokemon: () => Promise<void>;
}

export const usePokedexStore = create<PokedexStore>((set, get) => ({
  pokemons: [],
  pokemonList: [],
  isLoading: false,
  error: null,
  load: async () => {
    set({ isLoading: true, error: null });
    try {
      const repo = container.getPokemonRepository();
      const all = await repo.getAll();
      set({ pokemons: all, pokemonList: all, isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : String(e),
        isLoading: false,
      });
    }
  },
  loadPokemon: async () => {
    await get().load();
  },
}));
