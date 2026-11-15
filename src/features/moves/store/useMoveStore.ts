"use client";
import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type { MoveDTO } from "@/infrastructure/local-data/repositories/local-move.repository";

type Move = MoveDTO;

interface State {
  readonly moveList: Readonly<Record<string, Move>>;
  readonly grouped: Readonly<Record<string, readonly Move[]>>;
  readonly loading: boolean;
  readonly loadMoves: () => Promise<void>;
}

export const useMoveStore = create<State>((set) => ({
  moveList: {},
  grouped: {},
  loading: false,
  loadMoves: async () => {
    set({ loading: true });
    try {
      await container.init();
      const repo = container.getMoveRepository();
      const allMoves = await repo.getAll();

      const mapMutable: Record<string, Move> = {};
      for (const move of allMoves) {
        const key = move.id ?? move.name;
        if (key) {
          mapMutable[key] = move;
        }
      }

      const hasGrouped =
        "getGroupedByType" in repo &&
        typeof (repo as { getGroupedByType?: unknown }).getGroupedByType ===
          "function";
      let groupedResult: Record<string, readonly Move[]>;

      if (hasGrouped) {
        const repoWithGroup = repo as {
          getGroupedByType: () => Promise<Record<string, readonly Move[]>>;
        };
        groupedResult = await repoWithGroup.getGroupedByType();
      } else {
        const byTypeMutable: Record<string, Move[]> = {};
        for (const move of Object.values(mapMutable)) {
          const typeKey = move.type ?? "unknown";
          const existing = byTypeMutable[typeKey] ?? [];
          existing.push(move);
          byTypeMutable[typeKey] = existing;
        }
        groupedResult = byTypeMutable as Record<string, readonly Move[]>;
      }

      set({
        moveList: Object.freeze({ ...mapMutable }),
        grouped: Object.freeze({ ...groupedResult }),
        loading: false,
      });
    } catch (error) {
      console.error("[useMoveStore] loadMoves failed", error);
      set({ loading: false });
    }
  },
}));
