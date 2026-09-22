"use client";
import { create } from "zustand";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import { container } from "@/infrastructure/composition/container";

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
    if (pokemonList.length > 0) {
      console.log("[usePokedexStore] Ya cargado:", pokemonList.length);
      return;
    }
    if (isLoading) return;

    set({ isLoading: true, error: null });
    try {
      console.log("[usePokedexStore] Cargando Pokémon...");
      const repo = container.getPokemonRepository();
      const all = await repo.getAll();
      console.log("[usePokedexStore] Cargados:", all.length);

      if (all.length === 0) {
        console.warn(
          "[usePokedexStore] getAll() devolvió 0. Revisa dataset.json",
        );
        set({ error: "dataset.json vacío o no encontrado", isLoading: false });
        return;
      }

      set({ pokemonList: all, isLoading: false });
    } catch (e) {
      console.error("[usePokedexStore] Error:", e);
      set({
        error: e instanceof Error ? e.message : "Error cargando",
        isLoading: false,
      });
    }
  },
}));
