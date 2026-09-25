"use client";
import { create } from "zustand";
import type {
  WeatherId,
  TerrainId,
  StatusId,
} from "@/domain/battle/value-objects/BattleModifiers";
import type { PokemonId, StatName } from "@/domain/pokemon/types/pokemon";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  BattleResult,
  BattleConditions,
} from "@/domain/battle/types/BattleTypes";
import { container } from "@/infrastructure/composition/container";

export interface BattleParticipantInput {
  pokemonId: PokemonId;
  level: number;
  nature: Nature;
  ability?: string;
  item?: string;
  status?: StatusId;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
}

interface BattleStore {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  generation: number;
  conditions: BattleConditions;
  result: BattleResult | null;
  isCalculating: boolean;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (name: string) => void;
  setGeneration: (gen: number) => void;
  setConditions: (c: Partial<BattleConditions>) => void;
  setWeather: (w: WeatherId) => void;
  setTerrain: (t: TerrainId) => void;
  calculateResult: () => Promise<void>;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  generation: 9,
  conditions: { weather: "none", terrain: "none" } as BattleConditions,
  result: null,
  isCalculating: false,
  setAttacker: (input) => set({ attackerInput: input, result: null }),
  setDefender: (input) => set({ defenderInput: input, result: null }),
  setMoveName: (name) => set({ moveName: name, result: null }),
  setGeneration: (gen) => set({ generation: gen, result: null }),
  setConditions: (patch) =>
    set((s) => ({ conditions: { ...s.conditions, ...patch }, result: null })),
  setWeather: (weather) =>
    set((s) => ({ conditions: { ...s.conditions, weather }, result: null })),
  setTerrain: (terrain) =>
    set((s) => ({ conditions: { ...s.conditions, terrain }, result: null })),
  calculateResult: async () => {
    const { attackerInput, defenderInput, moveName, generation, conditions } =
      get();
    if (!attackerInput || !defenderInput || !moveName) return;
    set({ isCalculating: true });
    try {
      const useCase = container.getCalculateBattleScenarioUseCase();
      const res = await useCase.execute(
        generation,
        attackerInput,
        defenderInput,
        moveName,
        conditions,
      );
      set({ result: res, isCalculating: false });
    } catch (e) {
      set({ isCalculating: false });
      throw e;
    }
  },
}));
