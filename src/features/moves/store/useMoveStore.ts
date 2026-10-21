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

type MoveRepo = {
  init: () => Promise<void>;
  getAll: () => Promise<Move[]>;
  getGroupedByType?: () => Promise<Record<string, Move[]>>;
};

export const useMoveStore = create<State>((set) => ({
  moveList: {},
  grouped: {},
  loading: false,
  loadMoves: async () => {
    set({ loading: true });
    try {
      await container.init();
      const fallback = {
        getAll: () => container.getMoveRepository().getAll() as Promise<Move[]>,
        getGroupedByType: () =>
          (
            container.getMoveRepository() as unknown as {
              getGroupedByType?: () => Promise<Record<string, Move[]>>;
            }
          ).getGroupedByType?.() ??
          Promise.resolve({} as Record<string, Move[]>),
        init: async () => {},
      } as MoveRepo;
      const repo =
        (container as unknown as { moves: MoveRepo }).moves ?? fallback;
      if (repo.init) await repo.init();
      const all = (await repo.getAll()) as Move[];
      const map: Record<string, Move> = {};
      for (const m of all) map[m.name] = m;
      const grouped = (await (repo.getGroupedByType
        ? repo.getGroupedByType()
        : Promise.resolve({} as Record<string, Move[]>))) as Record<
        string,
        Move[]
      >;
      set({ moveList: map, grouped, loading: false });
    } catch (e) {
      set({ loading: false });
      console.error(e);
    }
  },
}));
