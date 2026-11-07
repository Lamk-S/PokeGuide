"use client";
import { create } from "zustand";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import {
  normalizeStatusId,
  normalizeTerrainId,
  normalizeWeatherId,
} from "@/domain/battle/constants/BattleFieldConstants";
import type {
  BattleResult,
  IBattleConditions,
  StatSet,
} from "@/domain/battle/types/BattleParticipant";
import type {
  StatusId,
  TerrainId,
  WeatherId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

export interface BattleParticipantInput {
  pokemonId: number;
  name?: string;
  level: number;
  nature: Nature;
  evs: StatSet | Record<string, number>;
  ivs: StatSet | Record<string, number>;
  moves: string[];
  item: string | null;
  ability: string | null;
  abilityId?: string;
  status: StatusId;
  isCriticalHit?: boolean;
}

export type { StatusId, TerrainId, WeatherId };
export type BattleConditions = IBattleConditions;

interface BattleStoreState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  attacker: BattleParticipantInput | null;
  defender: BattleParticipantInput | null;
  moveName: string;
  result: BattleResult | null;
  error: string | null;
  isCalculating: boolean;
  generation: number;
  hasCalculatedOnce: boolean;
  autoCalculate: boolean;
  conditions: IBattleConditions;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (name: string) => void;
  setGeneration: (gen: number) => void;
  setConditions: (cond: Partial<IBattleConditions>) => void;
  setWeather: (weather: WeatherId) => void;
  setTerrain: (terrain: TerrainId) => void;
  setAutoCalculate: (v: boolean) => void;
  calculate: () => Promise<void>;
  calculateResult: () => Promise<void>;
}

const pokemonRepository = new LocalPokemonRepository();
const moveRepository = new LocalMoveRepository();
const itemRepository = new LocalItemRepository();
const abilityRepository = new LocalAbilityRepository();
const pokemonBaseProvider = new PokemonBaseProviderAdapter(
  pokemonRepository as unknown as ConstructorParameters<
    typeof PokemonBaseProviderAdapter
  >[0],
);
const battleCalculator = new SmogonCalculatorAdapter();
const calculateBattleUseCase = new CalculateBattleScenarioUseCase(
  pokemonBaseProvider as unknown as ConstructorParameters<
    typeof CalculateBattleScenarioUseCase
  >[0],
  battleCalculator as unknown as ConstructorParameters<
    typeof CalculateBattleScenarioUseCase
  >[1],
);

const NULL_ITEM_IDS = new Set(["none", "no-item", "-"]);
const NULL_ABILITY_IDS = new Set(["none", "-"]);

function normalizeAndValidateItem(item: string | null): string | null {
  if (!item) return null;
  const n = normalizeId(item);
  if (!n) return null;
  if (NULL_ITEM_IDS.has(n)) return null;
  return n;
}

function normalizeAndValidateAbility(ability: string | null): string | null {
  if (!ability) return null;
  const n = normalizeId(ability);
  if (!n) return null;
  if (NULL_ABILITY_IDS.has(n)) return null;
  return n;
}

function normalizeInput(input: BattleParticipantInput): BattleParticipantInput {
  return {
    ...input,
    item: normalizeAndValidateItem(input.item),
    ability: normalizeAndValidateAbility(input.ability),
    status: normalizeStatusId(input.status),
    moves: (input.moves ?? []).map((m) => normalizeId(m)),
    isCriticalHit: Boolean(input.isCriticalHit),
  };
}

function normalizeConditions(conditions: IBattleConditions): IBattleConditions {
  return {
    weather: normalizeWeatherId(conditions.weather),
    terrain: normalizeTerrainId(conditions.terrain),
  };
}

export const useBattleStore = create<BattleStoreState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  attacker: null,
  defender: null,
  moveName: "",
  result: null,
  error: null,
  isCalculating: false,
  generation: 9,
  hasCalculatedOnce: false,
  autoCalculate: false,
  conditions: { weather: "none", terrain: "none" },

  setAttacker: (input) => {
    if (input === null) {
      set({ attackerInput: null, attacker: null });
      return;
    }
    const normalized = normalizeInput(input);
    set({ attackerInput: normalized, attacker: normalized });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setDefender: (input) => {
    if (input === null) {
      set({ defenderInput: null, defender: null });
      return;
    }
    const normalized = normalizeInput(input);
    set({ defenderInput: normalized, defender: normalized });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setMoveName: (name) => {
    set({ moveName: normalizeId(name) });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setConditions: (cond) => {
    const merged: IBattleConditions = {
      ...get().conditions,
      ...cond,
    } as IBattleConditions;
    set({ conditions: normalizeConditions(merged) });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setWeather: (weather) => {
    const next = normalizeConditions({ ...get().conditions, weather });
    set({ conditions: next });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setTerrain: (terrain) => {
    const next = normalizeConditions({ ...get().conditions, terrain });
    set({ conditions: next });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  setAutoCalculate: (v) => set({ autoCalculate: v }),

  setGeneration: (gen) => {
    const { attackerInput, defenderInput } = get();
    const safeGen = Math.min(9, Math.max(1, Math.floor(gen)));
    const nextAttacker = attackerInput ? { ...attackerInput } : null;
    const nextDefender = defenderInput ? { ...defenderInput } : null;
    if (safeGen < 2) {
      if (nextAttacker) nextAttacker.item = null;
      if (nextDefender) nextDefender.item = null;
    }
    if (safeGen < 3) {
      if (nextAttacker) nextAttacker.ability = null;
      if (nextDefender) nextDefender.ability = null;
    }
    set({
      generation: safeGen,
      attackerInput: nextAttacker,
      defenderInput: nextDefender,
      attacker: nextAttacker,
      defender: nextDefender,
      result: null,
      error: null,
    });
    if (get().autoCalculate && get().hasCalculatedOnce) {
      void get().calculate();
    }
  },

  calculate: async () => {
    const { attackerInput, defenderInput, moveName, generation, conditions } =
      get();
    if (!attackerInput || !defenderInput) {
      set({ error: "Selecciona atacante y defensor.", result: null });
      return;
    }
    if (!moveName) {
      set({ error: "Selecciona un movimiento.", result: null });
      return;
    }
    set({ isCalculating: true, error: null });
    try {
      await Promise.all([
        pokemonRepository.init(),
        moveRepository.init(),
        itemRepository.init(),
        abilityRepository.init(),
      ]);

      const normalizedMoveId = normalizeId(moveName);
      const moveRecord = await moveRepository.getByName(normalizedMoveId);
      if (!moveRecord) throw new Error(`MOVE_NOT_FOUND: ${moveName}`);

      const attackerForCalc = normalizeInput(attackerInput);
      const defenderForCalc = normalizeInput(defenderInput);

      type ExecuteParams = Parameters<typeof calculateBattleUseCase.execute>;
      const result = await calculateBattleUseCase.execute(
        generation,
        attackerForCalc as unknown as ExecuteParams[1],
        defenderForCalc as unknown as ExecuteParams[2],
        moveRecord.name,
        normalizeConditions(conditions) as unknown as ExecuteParams[4],
      );
      set({
        result: result as unknown as BattleResult,
        error: null,
        hasCalculatedOnce: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("FORM_NOT_AVAILABLE")) {
        set({
          error:
            "El Pokémon o la forma seleccionada no está disponible en la generación elegida.",
          result: null,
        });
      } else if (
        msg.includes("Invalid generation") ||
        msg.includes("INVALID_GENERATION")
      ) {
        set({
          error:
            "La generación seleccionada no es compatible con los datos actuales.",
          result: null,
        });
      } else if (msg.includes("MOVE_NOT_FOUND")) {
        set({
          error: "El movimiento seleccionado no existe en la base de datos.",
          result: null,
        });
      } else {
        set({
          error: msg || "Ocurrió un error al calcular el daño.",
          result: null,
        });
      }
    } finally {
      set({ isCalculating: false });
    }
  },

  calculateResult: async () => {
    return get().calculate();
  },
}));
