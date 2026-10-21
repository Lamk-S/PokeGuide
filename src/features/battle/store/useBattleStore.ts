import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type {
  BattleResult,
  IBattleParticipantInput,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";

export type BattleParticipantInput = IBattleParticipantInput;

interface BattleConditions extends IBattleConditions {
  weather: WeatherId | "none";
  terrain: TerrainId | "none";
}

interface BattleState {
  generation: number;
  attacker: IBattleParticipantInput | null;
  defender: IBattleParticipantInput | null;
  attackerInput: IBattleParticipantInput | null;
  defenderInput: IBattleParticipantInput | null;
  moveName: string;
  conditions: BattleConditions;
  result: BattleResult | null;
  isCalculating: boolean;
  error: string | null;
  isInitialized: boolean;
  setGeneration: (gen: number) => void;
  setAttacker: (attacker: IBattleParticipantInput | null) => void;
  setDefender: (defender: IBattleParticipantInput | null) => void;
  setMoveName: (moveName: string) => void;
  setConditions: (conditions: Partial<BattleConditions>) => void;
  setWeather: (weather: WeatherId) => void;
  setTerrain: (terrain: TerrainId) => void;
  calculate: () => Promise<void>;
  calculateResult: () => Promise<void>;
  reset: () => void;
  initialize: () => Promise<void>;
}

const initialConditions: BattleConditions = {
  weather: "none" as never,
  terrain: "none" as never,
};

export const useBattleStore = create<BattleState>((set, get) => ({
  generation: 9,
  attacker: null,
  defender: null,
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  conditions: initialConditions,
  result: null,
  isCalculating: false,
  error: null,
  isInitialized: false,

  setGeneration: (gen) => set({ generation: gen }),
  setAttacker: (attacker) => set({ attacker, attackerInput: attacker }),
  setDefender: (defender) => set({ defender, defenderInput: defender }),
  setMoveName: (moveName) => set({ moveName }),
  setConditions: (partial) =>
    set((state) => ({
      conditions: { ...state.conditions, ...partial } as BattleConditions,
    })),
  setWeather: (weather) =>
    set((state) => ({
      conditions: { ...state.conditions, weather } as BattleConditions,
    })),
  setTerrain: (terrain) =>
    set((state) => ({
      conditions: { ...state.conditions, terrain } as BattleConditions,
    })),

  initialize: async () => {
    if (get().isInitialized) return;
    try {
      await container.init();
      set({ isInitialized: true, error: null });
    } catch (e) {
      set({
        error:
          e instanceof Error
            ? e.message
            : "Failed to initialize battle container",
      });
    }
  },

  calculate: async () => {
    const { generation, attacker, defender, moveName, conditions } = get();
    if (!attacker || !defender || !moveName) {
      set({ error: "Missing attacker, defender or move" });
      return;
    }
    set({ isCalculating: true, error: null });
    try {
      await container.init();
      const useCase = container.getCalculateBattleScenarioUseCase();
      const result = await useCase.execute(
        generation,
        attacker,
        defender,
        moveName,
        { weather: conditions.weather, terrain: conditions.terrain },
      );
      set({ result, isCalculating: false, isInitialized: true });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Battle calculation failed",
        isCalculating: false,
      });
    }
  },

  calculateResult: async () => {
    return get().calculate();
  },

  reset: () =>
    set({
      attacker: null,
      defender: null,
      attackerInput: null,
      defenderInput: null,
      moveName: "",
      conditions: initialConditions,
      result: null,
      error: null,
      isCalculating: false,
    }),
}));
