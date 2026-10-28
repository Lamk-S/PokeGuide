"use client";

import { create } from "zustand";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  StatSet,
  IBattleParticipantInput,
} from "@/domain/battle/types/BattleParticipant";
import type { StatusId } from "@/domain/battle/value-objects/BattleModifiers";
import { NATURES } from "@/domain/stats/constants/natures";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import type {
  WeatherId,
  TerrainId,
} from "@/domain/battle/value-objects/BattleModifiers";

export type BattleSide = "attacker" | "defender";

export interface BattleParticipantInput {
  pokemonId: number;
  name?: string | null;
  level: number;
  nature: Nature;
  evs: StatSet;
  ivs: StatSet;
  moves: string[];
  item: string | null;
  ability: string | null;
  status: StatusId | "healthy";
  isCriticalHit?: boolean;
}

const seriousFound = NATURES.find((n) => n.name === "Serious");
const SERIOUS_NATURE: Nature =
  seriousFound ??
  ({
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  } as Nature);

const DEFAULT_EVS: StatSet = {
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
};

const DEFAULT_IVS: StatSet = {
  hp: 31,
  attack: 31,
  defense: 31,
  "special-attack": 31,
  "special-defense": 31,
  speed: 31,
};

function createDefaultInput(
  id: number,
  name?: string | null,
): BattleParticipantInput {
  return {
    pokemonId: id,
    name: name ?? null,
    level: 50,
    nature: SERIOUS_NATURE,
    evs: { ...DEFAULT_EVS },
    ivs: { ...DEFAULT_IVS },
    moves: [],
    item: null,
    ability: null,
    status: "healthy",
  };
}

function enforceShedinja(
  input: BattleParticipantInput,
): BattleParticipantInput {
  if (input.pokemonId === 292) {
    return {
      ...input,
      evs: { ...input.evs, hp: 0 },
      ivs: { ...input.ivs, hp: 0 },
    };
  }
  return input;
}

function cleanOnPokemonChange(
  newId: number,
  oldInput: BattleParticipantInput | null,
  name?: string | null,
): BattleParticipantInput {
  const base = oldInput
    ? { ...oldInput, pokemonId: newId, name: name ?? oldInput.name }
    : createDefaultInput(newId, name);

  const cleaned: BattleParticipantInput = {
    ...base,
    pokemonId: newId,
    name: name ?? base.name ?? null,
    moves: [],
    item: null,
    status: "healthy",
    nature: SERIOUS_NATURE,
    ability: null,
  };

  return enforceShedinja(cleaned);
}

let abortController: AbortController | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let latestRequestId = 0;
let repoInstance: LocalPokemonRepository | null = null;
let repoInitPromise: Promise<LocalPokemonRepository> | null = null;

async function getInitializedRepo(): Promise<LocalPokemonRepository> {
  if (repoInstance) return repoInstance;
  if (!repoInitPromise) {
    repoInitPromise = (async () => {
      const r = new LocalPokemonRepository();
      await r.init();
      repoInstance = r;
      return r;
    })();
  }
  return repoInitPromise;
}

interface BattleLabState {
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
  moveName: string;
  conditions: IBattleConditions;
  result: BattleResult | null;
  isCalculating: boolean;
  error: string | null;
  generation: number;
  attacker: BattleParticipantInput | null;
  defender: BattleParticipantInput | null;
  setAttacker: (input: BattleParticipantInput | null) => void;
  setDefender: (input: BattleParticipantInput | null) => void;
  setMoveName: (name: string) => void;
  calculateResult: () => Promise<void>;
  setGeneration: (gen: number) => void;
  setWeather: (w: WeatherId) => void;
  setTerrain: (t: TerrainId) => void;
  setPokemon: (
    side: BattleSide,
    pokemonId: number | null,
    name?: string | null,
  ) => void;
  setLevel: (side: BattleSide, level: number) => void;
  setNature: (side: BattleSide, nature: Nature) => void;
  setEV: (side: BattleSide, stat: keyof StatSet, value: number) => void;
  setIV: (side: BattleSide, stat: keyof StatSet, value: number) => void;
  setMoves: (side: BattleSide, moves: string[]) => void;
  setItem: (side: BattleSide, item: string | null) => void;
  setStatus: (side: BattleSide, status: StatusId | "healthy") => void;
  setAbility: (side: BattleSide, ability: string | null) => void;
  calculate: () => Promise<void>;
  scheduleCalculate: () => void;
}

export const useBattleStore = create<BattleLabState>((set, get) => ({
  attackerInput: null,
  defenderInput: null,
  attacker: null,
  defender: null,
  moveName: "",
  conditions: { weather: "none", terrain: "none" } as IBattleConditions,
  result: null,
  isCalculating: false,
  error: null,
  generation: 9,

  setAttacker: (input) =>
    set((state) => {
      if (!input) {
        return { attackerInput: null, attacker: null };
      }
      const prevId = state.attackerInput?.pokemonId;
      let next = { ...input };

      if (prevId !== undefined && prevId !== next.pokemonId) {
        next = {
          ...next,
          moves: [],
          item: null,
          status: "healthy",
          nature: SERIOUS_NATURE,
        };
      }

      next = enforceShedinja(next);
      setTimeout(() => get().scheduleCalculate(), 0);
      return { attackerInput: next, attacker: next };
    }),

  setDefender: (input) =>
    set((state) => {
      if (!input) {
        return { defenderInput: null, defender: null };
      }
      const prevId = state.defenderInput?.pokemonId;
      let next = { ...input };

      if (prevId !== undefined && prevId !== next.pokemonId) {
        next = {
          ...next,
          moves: [],
          item: null,
          status: "healthy",
          nature: SERIOUS_NATURE,
        };
      }

      next = enforceShedinja(next);
      setTimeout(() => get().scheduleCalculate(), 0);
      return { defenderInput: next, defender: next };
    }),

  setMoveName: (name) => {
    set({ moveName: name });
    get().scheduleCalculate();
  },

  setGeneration: (gen) => {
    set((state) => {
      const sanitize = (
        p: BattleParticipantInput | null,
      ): BattleParticipantInput | null => {
        if (!p) return p;
        let next = { ...p };
        if (gen <= 2) {
          next = { ...next, ability: null };
        }
        if (gen <= 1) {
          next = { ...next, item: null };
        }
        return next;
      };
      return {
        generation: gen,
        attackerInput: sanitize(state.attackerInput),
        attacker: sanitize(
          state.attacker as BattleParticipantInput | null,
        ) as BattleParticipantInput | null,
        defenderInput: sanitize(state.defenderInput),
        defender: sanitize(
          state.defender as BattleParticipantInput | null,
        ) as BattleParticipantInput | null,
      };
    });
    get().scheduleCalculate();
  },

  setWeather: (w) => {
    set((state) => ({
      conditions: { ...state.conditions, weather: w } as IBattleConditions,
    }));
    get().scheduleCalculate();
  },

  setTerrain: (t) => {
    set((state) => ({
      conditions: { ...state.conditions, terrain: t } as IBattleConditions,
    }));
    get().scheduleCalculate();
  },

  setPokemon: (side, pokemonId, name) => {
    if (pokemonId === null) {
      if (side === "attacker") {
        set({ attackerInput: null, attacker: null });
      } else {
        set({ defenderInput: null, defender: null });
      }
      return;
    }
    const state = get();
    const current =
      side === "attacker" ? state.attackerInput : state.defenderInput;
    const cleaned = cleanOnPokemonChange(pokemonId, current, name);
    if (side === "attacker") {
      set({ attackerInput: cleaned, attacker: cleaned });
    } else {
      set({ defenderInput: cleaned, defender: cleaned });
    }
    get().scheduleCalculate();
  },

  setLevel: (side, level) => {
    const clamped = Math.min(100, Math.max(1, Math.floor(level)));
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, level: clamped };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setNature: (side, nature) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, nature };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setEV: (side, stat, value) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      if (cur.pokemonId === 292 && stat === "hp") return {};
      const clamped = Math.min(252, Math.max(0, Math.floor(value)));
      const next = { ...cur, evs: { ...cur.evs, [stat]: clamped } };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setIV: (side, stat, value) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      if (cur.pokemonId === 292 && stat === "hp") return {};
      const clamped = Math.min(31, Math.max(0, Math.floor(value)));
      const next = { ...cur, ivs: { ...cur.ivs, [stat]: clamped } };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setMoves: (side, moves) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, moves: moves.slice(0, 4) };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setItem: (side, item) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, item };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setStatus: (side, status) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, status };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  setAbility: (side, ability) => {
    set((state) => {
      const cur =
        side === "attacker" ? state.attackerInput : state.defenderInput;
      if (!cur) return {};
      const next = { ...cur, ability };
      return side === "attacker"
        ? { attackerInput: next, attacker: next }
        : { defenderInput: next, defender: next };
    });
    get().scheduleCalculate();
  },

  scheduleCalculate: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      get().calculate();
    }, 250);
  },

  calculate: async () => {
    const { attackerInput, defenderInput, generation, conditions, moveName } =
      get();
    if (!attackerInput?.pokemonId || !defenderInput?.pokemonId) {
      set({ result: null });
      return;
    }

    const requestId = ++latestRequestId;

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const signal = abortController.signal;

    set({ isCalculating: true, error: null });

    try {
      const repo = await getInitializedRepo();
      if (signal.aborted || requestId !== latestRequestId) return;

      const provider = new PokemonBaseProviderAdapter(repo as never);
      const calculator = new SmogonCalculatorAdapter();
      const useCase = new CalculateBattleScenarioUseCase(
        provider as never,
        calculator as never,
      );

      const atk: IBattleParticipantInput = {
        pokemonId: attackerInput.pokemonId,
        level: attackerInput.level,
        nature: attackerInput.nature as never,
        evs: attackerInput.evs as never,
        ivs: attackerInput.ivs as never,
      };

      const def: IBattleParticipantInput = {
        pokemonId: defenderInput.pokemonId,
        level: defenderInput.level,
        nature: defenderInput.nature as never,
        evs: defenderInput.evs as never,
        ivs: defenderInput.ivs as never,
      };

      const result = await useCase.execute(
        generation,
        atk,
        def,
        moveName || attackerInput.moves[0] || "Tackle",
        { weather: conditions.weather, terrain: conditions.terrain } as never,
      );

      if (signal.aborted || requestId !== latestRequestId) return;

      set({ result: result as BattleResult, isCalculating: false });
    } catch (err: unknown) {
      if (signal.aborted || requestId !== latestRequestId) return;
      if ((err as Error).name === "AbortError") return;
      const raw = err instanceof Error ? err.message : String(err);
      const lower = raw.toLowerCase();

      let friendly: string;
      if (
        raw.includes("FORM_NOT_AVAILABLE") ||
        lower.includes("not available in gen") ||
        lower.includes("is not available in gen") ||
        lower.includes("not available in generation") ||
        lower.includes("is not available")
      ) {
        friendly =
          "El Pokémon o la forma seleccionada no está disponible en la generación elegida.";
      } else if (
        lower.includes("invalid generation") ||
        (lower.includes("unsupported") && lower.includes("generation"))
      ) {
        friendly =
          "La generación seleccionada no es compatible con los datos actuales.";
      } else if (raw.trim().length === 0) {
        friendly =
          "Ocurrió un error al calcular el daño. Intenta cambiar de generación o de forma.";
      } else {
        if (
          lower.includes("form") &&
          (lower.includes("gen") || lower.includes("mega"))
        ) {
          friendly =
            "El Pokémon o la forma seleccionada no está disponible en la generación elegida.";
        } else {
          friendly = raw;
        }
      }

      set({ error: friendly, result: null, isCalculating: false });
    }
  },

  calculateResult: async () => {
    return get().calculate();
  },
}));
