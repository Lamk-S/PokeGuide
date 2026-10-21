import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";

type Nature = {
  name: string;
  nameEs?: string;
  increasedStat: StatName | null;
  decreasedStat: StatName | null;
};
type Build = {
  pokemonId: number;
  evsActuales: EVDistribution;
  fijos: { naturaleza: Nature; ivs: Record<string, number>; level?: number };
  contexto: { nivel: number; generacion: number; generation: number };
};
type Objective =
  | { type: "speed"; target: number; stat: string }
  | {
      type: "damage";
      targetPercent: number;
      offensiveStat: string;
      moveId: string;
      defenderId: number;
    }
  | {
      type: "survival";
      defenseStat: string;
      moveId: string;
      attackerId: number;
    };

type Results = {
  speed?: {
    solution: number | null;
    achievedStat?: number;
    target: number;
    explanation?: { evidence: string[]; summary: string };
  } | null;
  damage?: {
    solution: number | null;
    achievedPercent?: number;
    target: number;
    explanation?: { evidence: string[]; summary: string };
  } | null;
  survival?: {
    solution: { hp: number; defense?: number; specialDefense?: number } | null;
    totalEVs?: number;
    explanation?: { evidence: string[]; summary: string };
  } | null;
};

type TabId = "speed" | "damage" | "survival";

function createEV(evs: Record<string, number> = {}): EVDistribution {
  const normalized = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
    ...evs,
  };
  return new EVDistribution(normalized as never);
}

interface OptimizerState {
  build: Build;
  objective: Objective;
  results: Results;
  errors: Record<TabId, string | null>;
  status: Record<TabId, "Idle" | "Calculating" | "Done" | "Error">;
  activeTab: TabId;
  isCalculating: boolean;
  error: string | null;
  isInitialized: boolean;
  setBuild: (
    patch: Partial<Build> & {
      fijos?: Partial<Build["fijos"]> & {
        naturaleza?: Partial<Nature> | string;
      };
      contexto?: Partial<Build["contexto"]>;
      evsActuales?: EVDistribution | Record<string, number>;
    },
  ) => void;
  setObjective: (obj: Objective) => void;
  setActiveTab: (tab: TabId) => void;
  calculate: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

const defaultNature: Nature = {
  name: "Serious",
  nameEs: "Fuerte",
  increasedStat: null,
  decreasedStat: null,
};
const defaultBuild: Build = {
  pokemonId: 25,
  evsActuales: createEV(),
  fijos: {
    naturaleza: defaultNature,
    ivs: {
      hp: 31,
      attack: 31,
      defense: 31,
      "special-attack": 31,
      "special-defense": 31,
      speed: 31,
    },
  },
  contexto: { nivel: 50, generacion: 9, generation: 9 },
};
const defaultObjective: Objective = {
  type: "speed",
  target: 168,
  stat: "speed",
};

export const useOptimizerStore = create<OptimizerState>((set, get) => ({
  build: defaultBuild,
  objective: defaultObjective,
  results: { speed: null, damage: null, survival: null },
  errors: { speed: null, damage: null, survival: null },
  status: { speed: "Idle", damage: "Idle", survival: "Idle" },
  activeTab: "speed",
  isCalculating: false,
  error: null,
  isInitialized: false,

  setBuild: (patch) =>
    set((state) => {
      const next = { ...state.build };
      if (patch.pokemonId !== undefined) next.pokemonId = patch.pokemonId;
      if (patch.evsActuales) {
        next.evsActuales =
          patch.evsActuales instanceof EVDistribution
            ? patch.evsActuales
            : createEV(patch.evsActuales as Record<string, number>);
      }
      if (patch.fijos) {
        let nextNature = next.fijos.naturaleza;
        const natPatch = patch.fijos.naturaleza;
        if (natPatch) {
          if (typeof natPatch === "string")
            nextNature = {
              name: natPatch,
              nameEs: natPatch,
              increasedStat: null,
              decreasedStat: null,
            };
          else
            nextNature = {
              name: natPatch.name ?? next.fijos.naturaleza.name,
              nameEs: natPatch.nameEs ?? next.fijos.naturaleza.nameEs,
              increasedStat:
                natPatch.increasedStat ??
                next.fijos.naturaleza.increasedStat ??
                null,
              decreasedStat:
                natPatch.decreasedStat ??
                next.fijos.naturaleza.decreasedStat ??
                null,
            };
        }
        next.fijos = {
          ...next.fijos,
          ...patch.fijos,
          naturaleza: nextNature,
          ivs: patch.fijos.ivs ?? next.fijos.ivs,
        };
      }
      if (patch.contexto) {
        const ctx = { ...next.contexto, ...patch.contexto };
        ctx.generation = ctx.generation ?? ctx.generacion;
        ctx.generacion = ctx.generacion ?? ctx.generation;
        next.contexto = ctx as Build["contexto"];
      }
      return { build: next };
    }),

  setObjective: (objective) => set({ objective, activeTab: objective.type }),
  setActiveTab: (activeTab) => set({ activeTab }),

  calculate: async () => {
    const { build, objective, activeTab } = get();
    set((s) => ({
      isCalculating: true,
      status: { ...s.status, [activeTab]: "Calculating" as const },
      errors: { ...s.errors, [activeTab]: null },
    }));
    try {
      await container.init();
      if (objective.type === "speed") {
        const uc = container.getOptimizeSpeedUseCase();
        const evRecord = (
          build.evsActuales as { getAll?: () => Record<string, number> }
        ).getAll
          ? (
              build.evsActuales as { getAll: () => Record<string, number> }
            ).getAll()
          : (build.evsActuales as unknown as Record<string, number>);
        const result = await (
          uc as {
            execute: (
              i: unknown,
            ) => Promise<{ solution: number; achievedStat: number }>;
          }
        ).execute({
          pokemonId: build.pokemonId,
          evs: evRecord,
          target: objective.target,
        });
        set({
          results: {
            ...get().results,
            speed: {
              solution: result.solution,
              achievedStat: result.achievedStat,
              target: objective.target,
            },
          },
          isCalculating: false,
          status: { ...get().status, [activeTab]: "Done" as const },
        });
      } else if (objective.type === "damage") {
        const uc = container.getOptimizeDamageUseCase();
        const result = await (
          uc as {
            execute: (
              i: unknown,
            ) => Promise<{ solution: number; achievedPercent: number }>;
          }
        ).execute(build as never);
        set({
          results: {
            ...get().results,
            damage: {
              solution: result.solution,
              achievedPercent: result.achievedPercent,
              target: objective.targetPercent,
            },
          },
          isCalculating: false,
          status: { ...get().status, [activeTab]: "Done" as const },
        });
      } else {
        const uc = container.getOptimizeSurvivalUseCase();
        const result = await (
          uc as {
            execute: (i: unknown) => Promise<{
              solution: {
                hp: number;
                defense?: number;
                specialDefense?: number;
              };
              totalEVs: number;
            }>;
          }
        ).execute(build as never);
        set({
          results: {
            ...get().results,
            survival: { solution: result.solution, totalEVs: result.totalEVs },
          },
          isCalculating: false,
          status: { ...get().status, [activeTab]: "Done" as const },
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set((s) => ({
        error: msg,
        isCalculating: false,
        errors: { ...s.errors, [s.activeTab]: msg },
        status: { ...s.status, [s.activeTab]: "Error" as const },
      }));
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    try {
      await container.init();
      set({ isInitialized: true, error: null });
    } catch (e) {
      set({
        error:
          e instanceof Error ? e.message : "Failed to initialize optimizer",
      });
    }
  },

  reset: () =>
    set({
      build: {
        ...defaultBuild,
        evsActuales: createEV(),
        fijos: { ...defaultBuild.fijos, naturaleza: { ...defaultNature } },
      },
      objective: defaultObjective,
      results: { speed: null, damage: null, survival: null },
      errors: { speed: null, damage: null, survival: null },
      status: { speed: "Idle", damage: "Idle", survival: "Idle" },
      error: null,
      isCalculating: false,
    }),
}));

export const useBuild = () => useOptimizerStore((s) => s.build);
export const useObjective = () => useOptimizerStore((s) => s.objective);
export const useActiveTab = () => useOptimizerStore((s) => s.activeTab);
export const useOptimizerResults = () => useOptimizerStore((s) => s.results);
export const useOptimizerErrors = () => useOptimizerStore((s) => s.errors);
export const useOptimizerStatus = () => useOptimizerStore((s) => s.status);
export const useOptimizerActions = () => {
  const setBuild = useOptimizerStore((s) => s.setBuild);
  const setObjective = useOptimizerStore((s) => s.setObjective);
  const setActiveTab = useOptimizerStore((s) => s.setActiveTab);
  const calculate = useOptimizerStore((s) => s.calculate);
  const reset = useOptimizerStore((s) => s.reset);
  return { setBuild, setObjective, setActiveTab, calculate, reset };
};
