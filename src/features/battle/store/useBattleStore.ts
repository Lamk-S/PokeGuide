import { create } from "zustand";
import { calculateBattleScenarioUseCase } from "@/infrastructure/composition/battle.composition";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { Nature, StatName } from "@/domain/stats/types/StatTypes";

export interface BattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  ivs: Record<StatName, number>;
  evs: Record<StatName, number>;
  ability?: string;
  item?: string;
}

interface BattleStore {
  generation: number;
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  result: BattleResult | null;
  isCalculating: boolean;
  error: string | null;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (move: string) => void;
  setGeneration: (gen: number) => void;
  calculateResult: () => Promise<void>;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  generation: 9,
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  result: null,
  isCalculating: false,
  error: null,
  setGeneration: (generation) => set({ generation, result: null }),
  setAttacker: (attackerInput) =>
    set({ attackerInput, result: null, error: null }),
  setDefender: (defenderInput) =>
    set({ defenderInput, result: null, error: null }),
  setMoveName: (moveName) => set({ moveName, result: null }),
  calculateResult: async () => {
    const { generation, attackerInput, defenderInput, moveName } = get();
    if (!attackerInput || !defenderInput || !moveName) {
      set({ error: "Faltan parámetros" });
      return;
    }
    set({ isCalculating: true });
    try {
      const result = await calculateBattleScenarioUseCase.execute(
        generation,
        attackerInput,
        defenderInput,
        moveName,
      );
      set({ result, isCalculating: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Fallo",
        isCalculating: false,
      });
    }
  },
}));
