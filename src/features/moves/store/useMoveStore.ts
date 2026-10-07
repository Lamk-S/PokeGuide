import { create } from "zustand";
import { moveRepository } from "@/infrastructure/composition/battle.composition";
import type { Move } from "@/domain/moves/types/move";

interface MoveStore {
  moves: Move[];
  moveList: Record<string, Move>;
  groupedByType: Record<string, Move[]>;
  isLoading: boolean;
  loadMoves: () => Promise<void>;
}

export const useMoveStore = create<MoveStore>((set) => ({
  moves: [],
  moveList: {},
  groupedByType: {},
  isLoading: false,
  loadMoves: async () => {
    set({ isLoading: true });
    const moves = await moveRepository.getAll();

    const grouped = moves.reduce<Record<string, Move[]>>((acc, move) => {
      const key = move.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(move);
      return acc;
    }, {});

    const map = moves.reduce<Record<string, Move>>((acc, move) => {
      acc[move.name] = move;
      return acc;
    }, {});

    set({ moves, moveList: map, groupedByType: grouped, isLoading: false });
  },
}));
