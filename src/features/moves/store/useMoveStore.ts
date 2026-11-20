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
        const idKey = move.id?.toLowerCase().replace(/\s+/g, "-");
        const nameKey = move.name?.toLowerCase();
        const nameEsKey = move.nameEs?.toLowerCase();
        const idWithSpace = move.id?.toLowerCase().replace(/-/g, " ");
        const nameWithDash = move.name?.toLowerCase().replace(/\s+/g, "-");

        if (idKey) mapMutable[idKey] = move;
        if (nameKey) mapMutable[nameKey] = move;
        if (nameEsKey) mapMutable[nameEsKey] = move;
        if (idWithSpace) mapMutable[idWithSpace] = move;
        if (nameWithDash) mapMutable[nameWithDash] = move;
        const originalKey = move.id ?? move.name;
        if (originalKey) mapMutable[originalKey] = move;
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
        const seenIds = new Set<string>();
        for (const move of allMoves) {
          if (seenIds.has(move.id)) continue;
          seenIds.add(move.id);
          const typeKey = move.type ?? "unknown";
          const existing = byTypeMutable[typeKey] ?? [];
          existing.push(move);
          byTypeMutable[typeKey] = existing;
        }
        groupedResult = byTypeMutable as Record<string, readonly Move[]>;
      }

      console.log(
        `[useMoveStore] ${allMoves.length} movimientos cargados, ${Object.keys(mapMutable).length} claves indexadas`,
      );

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
