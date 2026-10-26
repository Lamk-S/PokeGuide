"use client";

import { create } from "zustand";
import { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";
import type { Objective } from "@/domain/optimization/value-objects/Objective";
import type { BuildConfiguration } from "@/domain/optimization/entities/BuildConfiguration";
import { OptimizationWorkerClient } from "@/infrastructure/workers/OptimizationWorkerClient";
import type { Proof } from "@/domain/optimization/types/OptimizationTypes";
import { NATURES } from "@/domain/stats/constants/natures";
import type { Nature } from "@/domain/stats/types/StatTypes";

export type BuildState = {
  pokemonId: number;
  evsActuales: EVDistribution;
  fijos: {
    ivs: Record<string, number>;
    naturaleza: Nature;
  };
  contexto: {
    nivel: number;
    generacion: number;
  };
};

export type OptimizerResultsState = {
  speed?: { solution: number | null };
  damage?: { solution: number | null };
  survival?: {
    solution: { hp: number; defense?: number; specialDefense?: number } | null;
  };
};

export interface OptimizationResultCompat {
  status: "Optimal" | "Infeasible" | "Unsupported" | "Error";
  solution?: unknown;
  cost?: number;
  explanation?: { evidence: string[]; summary?: string; proof?: Proof };
}

type OptimizerStatus = "idle" | "optimizing" | "success" | "error";

interface OptimizerState {
  selectedPokemonId: number | null;
  selectedMoveId: string | null;
  level: number;
  buildConfiguration: BuildConfiguration | null;
  objective: Objective;
  evs: EVDistribution;
  ivs: Record<string, number>;
  baseStats: Record<string, number>;
  natureId: string;
  generation: number;
  optimizationResult: OptimizationResultCompat | null;
  isOptimizing: boolean;
  optimizationError: string | null;
  status: OptimizerStatus;
  build: BuildState;
  results: OptimizerResultsState;

  setSelectedPokemonId: (id: number | null) => void;
  setSelectedMoveId: (id: string | null) => void;
  setLevel: (level: number) => void;
  setBuildConfiguration: (config: BuildConfiguration | null) => void;
  setObjective: (objective: Objective) => void;
  setEvs: (evs: EVDistribution) => void;
  setBuild: (build: Partial<BuildState>) => void;
  clearResult: () => void;
  clearError: () => void;
  reset: () => void;
  optimizeBuild: () => Promise<void>;
}

function getNatureById(id: string): Nature {
  const found = NATURES.find((n) => n.name.toLowerCase() === id.toLowerCase());
  if (found) return found as Nature;
  return {
    name: "Serious",
    nameEs: "Seria",
    increasedStat: null,
    decreasedStat: null,
  } as Nature;
}

const DEFAULT_OBJECTIVE: Objective = {
  type: "speed",
  target: 168,
  stat: "speed",
} as unknown as Objective;

const INITIAL_BUILD: BuildState = {
  pokemonId: 25,
  evsActuales: EVDistribution.empty(),
  fijos: {
    ivs: {
      hp: 31,
      attack: 31,
      defense: 31,
      "special-attack": 31,
      "special-defense": 31,
      speed: 31,
    },
    naturaleza: getNatureById("serious"),
  },
  contexto: { nivel: 50, generacion: 9 },
};

const INITIAL_STATE: Omit<
  OptimizerState,
  | "setSelectedPokemonId"
  | "setSelectedMoveId"
  | "setLevel"
  | "setBuildConfiguration"
  | "setObjective"
  | "setEvs"
  | "setBuild"
  | "clearResult"
  | "clearError"
  | "reset"
  | "optimizeBuild"
> = {
  selectedPokemonId: 25,
  selectedMoveId: null,
  level: 50,
  buildConfiguration: null,
  objective: DEFAULT_OBJECTIVE,
  evs: EVDistribution.empty(),
  ivs: {
    hp: 31,
    attack: 31,
    defense: 31,
    "special-attack": 31,
    "special-defense": 31,
    speed: 31,
  },
  baseStats: {
    hp: 100,
    attack: 100,
    defense: 100,
    "special-attack": 100,
    "special-defense": 100,
    speed: 100,
  },
  natureId: "serious",
  generation: 9,
  optimizationResult: null,
  isOptimizing: false,
  optimizationError: null,
  status: "idle",
  build: INITIAL_BUILD,
  results: {},
};

const workerClient = OptimizationWorkerClient.getInstance();

export const useOptimizerStore = create<OptimizerState>()((set, get) => ({
  ...INITIAL_STATE,

  setSelectedPokemonId: (id) =>
    set((state) => ({
      selectedPokemonId: id,
      build: { ...state.build, pokemonId: id ?? state.build.pokemonId },
      optimizationResult: null,
      optimizationError: null,
      status: "idle",
    })),

  setSelectedMoveId: (id) => set({ selectedMoveId: id }),

  setLevel: (level) =>
    set((state) => ({
      level,
      build: {
        ...state.build,
        contexto: { ...state.build.contexto, nivel: level },
      },
      optimizationResult: null,
    })),

  setBuildConfiguration: (config) => set({ buildConfiguration: config }),

  setObjective: (objective) =>
    set({
      objective,
      optimizationResult: null,
      results: {},
    }),

  setEvs: (evs) =>
    set((state) => ({
      evs,
      build: { ...state.build, evsActuales: evs },
    })),

  setBuild: (partial) =>
    set((state) => ({
      build: {
        ...state.build,
        ...partial,
        fijos: { ...state.build.fijos, ...(partial.fijos ?? {}) },
        contexto: { ...state.build.contexto, ...(partial.contexto ?? {}) },
      },
    })),

  clearResult: () =>
    set({ optimizationResult: null, results: {}, status: "idle" }),

  clearError: () =>
    set({
      optimizationError: null,
      status: get().optimizationResult ? "success" : "idle",
    }),

  reset: () =>
    set({
      ...INITIAL_STATE,
      evs: EVDistribution.empty(),
      build: { ...INITIAL_BUILD, evsActuales: EVDistribution.empty() },
    }),

  optimizeBuild: async () => {
    const {
      selectedPokemonId,
      level,
      buildConfiguration,
      objective,
      evs,
      ivs,
      baseStats,
      natureId,
      generation,
      selectedMoveId,
      build,
    } = get();

    const pokemonId = selectedPokemonId ?? build.pokemonId;

    if (!pokemonId) {
      set({
        optimizationError: "Selecciona un Pokémon para optimizar.",
        isOptimizing: false,
        status: "error",
      });
      return;
    }

    if (!objective) {
      set({
        optimizationError: "Configura un objetivo de optimización.",
        isOptimizing: false,
        status: "error",
      });
      return;
    }

    set({
      isOptimizing: true,
      optimizationError: null,
      optimizationResult: null,
      status: "optimizing",
    });

    try {
      const result = await workerClient.run({
        pokemonId,
        level,
        buildConfiguration: buildConfiguration ?? undefined,
        objective: objective as unknown as never,
        currentEvs: evs.getAll(),
        currentIvs: ivs,
        baseStats,
        natureId,
        generation,
        moveId: selectedMoveId ?? undefined,
      });

      const legacyResults: OptimizerResultsState = {};
      if (
        objective &&
        (objective as { type: string }).type === "speed" &&
        typeof result.solution === "number"
      ) {
        legacyResults.speed = { solution: result.solution as number };
      } else if (
        objective &&
        (objective as { type: string }).type === "damage" &&
        typeof result.solution === "number"
      ) {
        legacyResults.damage = { solution: result.solution as number };
      } else if (
        objective &&
        (objective as { type: string }).type === "survival" &&
        result.solution
      ) {
        legacyResults.survival = {
          solution: result.solution as {
            hp: number;
            defense?: number;
            specialDefense?: number;
          },
        };
      }

      set({
        optimizationResult: result as OptimizationResultCompat,
        results: legacyResults,
        isOptimizing: false,
        status: "success",
        optimizationError: null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado durante la optimización.";
      set({
        optimizationError: message,
        isOptimizing: false,
        status: "error",
        optimizationResult: null,
      });
    }
  },
}));

export const useObjective = () => useOptimizerStore((s) => s.objective);
export const useBuild = () => useOptimizerStore((s) => s.build);
export const useOptimizerResults = () => useOptimizerStore((s) => s.results);
export const useOptimizerActions = () =>
  useOptimizerStore((s) => ({
    setObjective: s.setObjective,
    setBuild: s.setBuild,
    setEvs: s.setEvs,
    clearResult: s.clearResult,
    clearError: s.clearError,
    optimizeBuild: s.optimizeBuild,
  }));

export const useIsOptimizing = () => useOptimizerStore((s) => s.isOptimizing);
export const useOptimizationError = () =>
  useOptimizerStore((s) => s.optimizationError);
