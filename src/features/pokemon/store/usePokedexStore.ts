import { create } from "zustand";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";

interface PokedexStore {
  pokemonList: Pokemon[];
  isLoading: boolean;
  error: string | null;
  loadPokemon: () => Promise<void>;
}

const repository = new LocalPokemonRepository();

export const usePokedexStore = create<PokedexStore>((set, get) => ({
  pokemonList: [],
  isLoading: false,
  error: null,

  loadPokemon: async () => {
    const { pokemonList, isLoading } = get();
    if (pokemonList.length > 0 || isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const list = await repository.getAll();
      set({ pokemonList: list, isLoading: false });
    } catch (err) {
      console.error("[PokedexStore] Failed to load dataset", err);
      set({
        error: "No se pudo cargar el dataset local de Pokémon.",
        isLoading: false,
      });
    }
  },
}));
