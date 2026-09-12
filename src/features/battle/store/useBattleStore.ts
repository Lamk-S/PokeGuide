import { create } from "zustand";
import { calculateBattleScenarioUseCase } from "@/infrastructure/composition/battle.composition";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { Nature, StatName } from "@/domain/stats/types/StatTypes";

export interface BattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  ability?: string;
  item?: string;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
}

interface BattleStore {
  generation: number;
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  result: BattleResult | null;
  isCalculating: boolean;
  error: string | null;
  setGeneration: (gen: number) => void;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (move: string) => void;
  calculateResult: () => Promise<void>;
  reset: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  generation: 9,
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  result: null,
  isCalculating: false,
  error: null,

  setGeneration: (generation) => set({ generation, result: null, error: null }),
  setAttacker: (attackerInput) =>
    set({ attackerInput, result: null, error: null }),
  setDefender: (defenderInput) =>
    set({ defenderInput, result: null, error: null }),
  setMoveName: (moveName) => set({ moveName, result: null, error: null }),

  reset: () =>
    set({
      attackerInput: null,
      defenderInput: null,
      moveName: "",
      result: null,
      error: null,
      isCalculating: false,
    }),

  calculateResult: async () => {
    const {
      generation,
      attackerInput,
      defenderInput,
      moveName,
      isCalculating,
    } = get();

    if (isCalculating) return;
    if (!attackerInput || !defenderInput || !moveName) {
      set({ error: "Faltan parámetros para simular", result: null });
      return;
    }

    set({ isCalculating: true, error: null });

    try {
      const result = await calculateBattleScenarioUseCase.execute(
        generation,
        attackerInput,
        defenderInput,
        moveName,
      );
      set({ result, isCalculating: false, error: null });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Fallo en la simulación",
        result: null,
        isCalculating: false,
      });
    }
  },
}));
