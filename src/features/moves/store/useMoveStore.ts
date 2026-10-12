"use client";
import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";

type Move = {
  name: string;
  nameEs?: string;
  type: string;
  power?: number | null;
  accuracy?: number | null;
  category?: string;
};
interface State {
  moveList: Record<string, Move>;
  grouped: Record<string, Move[]>;
  loading: boolean;
  loadMoves: () => Promise<void>;
}

export const useMoveStore = create<State>((set) => ({
  moveList: {},
  grouped: {},
  loading: false,
  loadMoves: async () => {
    set({ loading: true });
    await container.moves.init();
    const all = (await container.moves.getAll()) as unknown as Move[];
    const map: Record<string, Move> = {};
    for (const m of all) map[m.name] = m;
    const grouped =
      (await container.moves.getGroupedByType()) as unknown as Record<
        string,
        Move[]
      >;
    set({ moveList: map, grouped, loading: false });
  },
}));
