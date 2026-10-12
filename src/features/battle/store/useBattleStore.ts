"use client";
import { create } from "zustand";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import type { Nature } from "@/domain/stats/types/StatTypes";
import {
  ensureBattleDeps,
  battleUseCase,
} from "@/infrastructure/composition/battle.composition";

export type BattleParticipantInput = {
  pokemonId: number;
  level: number;
  nature: Nature;
  evs: unknown;
  ivs: unknown;
  ability?: string | undefined;
  item?: string | undefined;
  status?: string | undefined;
  isCriticalHit?: boolean | undefined;
};

interface BattleState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  result: BattleResult | null;
  conditions: IBattleConditions;
  isCalculating: boolean;
  generation: number;
  setAttacker: (i: BattleParticipantInput | null) => void;
  setDefender: (i: BattleParticipantInput | null) => void;
  setMoveName: (n: string) => void;
  setGeneration: (g: number) => void;
  setWeather: (w: WeatherId) => void;
  setTerrain: (t: TerrainId) => void;
  calculateResult: () => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  result: null,
  conditions: { weather: "none", terrain: "none" } as IBattleConditions,
  isCalculating: false,
  generation: 9,
  setAttacker: (attackerInput) => set({ attackerInput }),
  setDefender: (defenderInput) => set({ defenderInput }),
  setMoveName: (moveName) => set({ moveName }),
  setGeneration: (generation) => set({ generation }),
  setWeather: (weather) =>
    set((s) => ({
      conditions: { ...s.conditions, weather } as IBattleConditions,
    })),
  setTerrain: (terrain) =>
    set((s) => ({
      conditions: { ...s.conditions, terrain } as IBattleConditions,
    })),
  calculateResult: async () => {
    const { attackerInput, defenderInput, moveName, conditions, generation } =
      get();
    if (!attackerInput || !defenderInput || !moveName) return;
    set({ isCalculating: true });
    try {
      await ensureBattleDeps();
      const result = await battleUseCase.execute(
        generation,
        attackerInput as never,
        defenderInput as never,
        moveName,
        conditions,
      );
      set({ result: result as unknown as BattleResult });
    } finally {
      set({ isCalculating: false });
    }
  },
}));
