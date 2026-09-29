import { create } from "zustand";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  StatusId,
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";

export interface BattleParticipantInput {
  pokemonId: number;
  level: number;
  nature: Nature;
  evs: Record<string, { value: number } | number>;
  ivs: Record<string, { value: number } | number>;
  ability?: string | undefined;
  abilityId?: string | undefined;
  item?: string | undefined;
  status?: StatusId | undefined;
  isCriticalHit?: boolean | undefined;
}

export interface BattleConditions {
  weather: WeatherId;
  terrain: TerrainId;
  isCriticalHit?: boolean | undefined;
}

export interface BattleState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  moveId: string | undefined;
  result: import("@/domain/battle/types/BattleTypes").BattleResult | null;
  conditions: BattleConditions;
  isCalculating: boolean;
  generation: number;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (name: string) => void;
  setConditions: (conditions: Partial<BattleConditions>) => void;
  setWeather: (weather: WeatherId) => void;
  setTerrain: (terrain: TerrainId) => void;
  setGeneration: (gen: number) => void;
  calculateResult: () => Promise<void>;
}

export const useBattleStore = create<BattleState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  moveName: "",
  moveId: undefined,
  result: null,
  conditions: {
    weather: "none",
    terrain: "none",
  },
  isCalculating: false,
  generation: 9,

  setAttacker: (input) => set({ attackerInput: input }),
  setDefender: (input) => set({ defenderInput: input }),
  setMoveName: (name) =>
    set({ moveName: name, moveId: name.toLowerCase().replace(/\s+/g, "-") }),

  setConditions: (newConditions) =>
    set((state) => ({
      conditions: { ...state.conditions, ...newConditions },
    })),

  setWeather: (weather) =>
    set((state) => ({
      conditions: { ...state.conditions, weather },
    })),

  setTerrain: (terrain) =>
    set((state) => ({
      conditions: { ...state.conditions, terrain },
    })),

  setGeneration: (gen) => set({ generation: gen }),

  calculateResult: async () => {
    const { attackerInput, defenderInput, moveName, generation, conditions } =
      get();

    if (!attackerInput || !defenderInput || !moveName) {
      set({ result: null });
      return;
    }

    set({ isCalculating: true });

    try {
      const { SmogonCalculatorAdapter } = await import(
        "@/infrastructure/battle/smogon/SmogonCalculatorAdapter"
      );
      const { normalizeBattleScenario } = await import(
        "@/domain/battle/services/BattleScenarioNormalizer"
      );

      const rawScenario = {
        attacker: attackerInput,
        defender: defenderInput,
        moveName,
        generation,
        conditions,
      };

      const normalized = normalizeBattleScenario(rawScenario as never);

      const scenario = {
        attacker: {
          id: normalized.attacker.id,
          name: normalized.attacker.name,
          level: normalized.attacker.level,
          nature: normalized.attacker.nature,
          evs: normalized.attacker.evs as Record<string, number>,
          ivs: normalized.attacker.ivs as Record<string, number>,
          ability: normalized.attacker.ability,
          abilityId: normalized.attacker.abilityId,
          item: normalized.attacker.item,
          status: normalized.attacker.status,
          isCriticalHit: normalized.attacker.isCriticalHit,
        },
        defender: {
          id: normalized.defender.id,
          name: normalized.defender.name,
          level: normalized.defender.level,
          nature: normalized.defender.nature,
          evs: normalized.defender.evs as Record<string, number>,
          ivs: normalized.defender.ivs as Record<string, number>,
          ability: normalized.defender.ability,
          abilityId: normalized.defender.abilityId,
          item: normalized.defender.item,
          status: normalized.defender.status,
        },
        moveName: normalized.moveName,
        moveId: normalized.moveId,
        moveDisplayName: normalized.moveDisplayName,
        generation: normalized.generation,
        conditions: normalized.conditions,
      };

      const adapter = new SmogonCalculatorAdapter();
      const result = adapter.calculate(scenario as never);

      set({ result, isCalculating: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (
        msg.includes("no está disponible en Gen") ||
        msg.includes("No se pudo crear Pokémon")
      ) {
        console.warn("Validación de generación:", msg);
      } else {
        console.error("Error calculando daño:", error);
      }
      set({ isCalculating: false, result: null });
    }
  },
}));
