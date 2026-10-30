"use client";
import { create } from "zustand";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { container } from "@/infrastructure/composition/container";

interface State {
  pokemonList: Pokemon[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  loadPokemon: () => Promise<void>;
}

type PokemonRepo = {
  init: () => Promise<void>;
  getAll: () => Promise<Pokemon[]>;
  getById?: (id: number) => Promise<Pokemon | undefined>;
};

export const usePokedexStore = create<State>((set) => ({
  pokemonList: [],
  loading: false,
  isLoading: false,
  error: null,
  loadPokemon: async () => {
    set({ loading: true, isLoading: true, error: null });
    try {
      await container.init();
      const repo = (container as unknown as { pokemon: PokemonRepo })
        .pokemon ?? {
        getAll: () =>
          container.getPokemonRepository().getAll() as unknown as Promise<
            Pokemon[]
          >,
        init: async () => {},
      };
      if (repo.init) await repo.init();
      const raw = await repo.getAll();
      const list = raw as unknown as Pokemon[];
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
