import { create } from "zustand";
import { moveRepository } from "@/infrastructure/composition/battle.composition";
import type { Move } from "@/domain/moves/types/move";

interface MoveStore {
  moveList: Record<string, Move>;
  isLoading: boolean;
  loadMoves: () => Promise<void>;
}

export const useMoveStore = create<MoveStore>((set, get) => ({
  moveList: {},
  isLoading: false,

  loadMoves: async () => {
    if (Object.keys(get().moveList).length > 0 || get().isLoading) return;
    set({ isLoading: true });
    try {
      const list = await moveRepository.getAll();
      const map = list.reduce(
        (acc, move) => {
          acc[move.name] = move;
          return acc;
        },
        {} as Record<string, Move>,
      );
      set({ moveList: map, isLoading: false });
    } catch (err) {
      console.error("[MoveStore]", err);
      set({ isLoading: false });
    }
  },
}));
