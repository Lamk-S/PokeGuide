"use client";
import { create } from "zustand";
import {
  LocalPokemonRepository,
  type OptimizedPokemon,
  type PokemonFull,
} from "@/infrastructure/local-data/repositories/local-pokemon.repository";

interface PokedexState {
  readonly pokemonList: ReadonlyArray<OptimizedPokemon>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly loadPokemon: () => Promise<void>;
  readonly getPokemonById: (id: number) => Promise<PokemonFull | null>;
  readonly searchOptimized: (
    q: string,
  ) => Promise<ReadonlyArray<OptimizedPokemon>>;
}

export const usePokedexStore = create<PokedexState>((set) => ({
  pokemonList: Object.freeze([]) as ReadonlyArray<OptimizedPokemon>,
  isLoading: false,
  error: null,

  loadPokemon: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await LocalPokemonRepository.getAllOptimized();
      set({ pokemonList: Object.freeze([...list]), isLoading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Error cargando Pokédex",
        isLoading: false,
      });
    }
  },

  getPokemonById: async (id: number) => {
    try {
      return await LocalPokemonRepository.getById(id);
    } catch {
      return null;
    }
  },

  searchOptimized: async (q: string) => {
    return LocalPokemonRepository.searchOptimized(q);
  },
}));
