import { create } from "zustand";
import { container } from "@/infrastructure/composition/container";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";

function createEV(evs: Record<string, number> = {}): EVDistribution {
  const normalized: Record<string, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
    ...evs,
  };
  try {
    const Ctor = EVDistribution as unknown as new (
      e: Record<string, number>,
    ) => EVDistribution;
    return new Ctor(normalized);
  } catch {
    try {
      const CtorEmpty = EVDistribution as unknown as new () => EVDistribution;
      let cur = new CtorEmpty() as unknown as EVDistribution & {
        with: (s: string, v: number) => EVDistribution;
      };
      for (const [k, v] of Object.entries(normalized)) {
        if (v !== 0) cur = cur.with(k, v) as typeof cur;
      }
      return cur as EVDistribution;
    } catch {
      return normalized as unknown as EVDistribution;
    }
  }
}

type NatureCompat = {
  name: string;
  nameEs?: string;
  increasedStat: StatName | null;
  decreasedStat: StatName | null;
};
type BuildCompat = {
  pokemonId: number;
  evsActuales: EVDistribution;
  fijos: {
    naturaleza: NatureCompat;
    ivs: Record<string, number>;
    level?: number;
  };
  contexto: { nivel: number; generacion: number; generation?: number };
};

type ObjectiveCompat =
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

type ResultsCompat = {
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

interface OptimizerState {
  problem: unknown | null;
  buildConfig: unknown | null;
  optimizationType: TabId;
  result: unknown | null;
  isCalculating: boolean;
  error: string | null;
  isInitialized: boolean;
  build: BuildCompat;
  objective: ObjectiveCompat;
  results: ResultsCompat;
  errors: Record<TabId, string | null>;
  status: Record<TabId, "Idle" | "Calculating" | "Done" | "Error">;
  activeTab: TabId;
  setProblem: (p: unknown) => void;
  setBuildConfig: (b: unknown) => void;
  setOptimizationType: (t: TabId) => void;
  calculate: () => Promise<void>;
  setBuild: (
    patch: Partial<BuildCompat> & {
      fijos?: Partial<BuildCompat["fijos"]> & {
        naturaleza?: Partial<NatureCompat> | string;
      };
      contexto?: Partial<BuildCompat["contexto"]>;
      evsActuales?: EVDistribution | Record<string, number>;
    },
  ) => void;
  setObjective: (obj: ObjectiveCompat) => void;
  setActiveTab: (tab: TabId) => void;
  calculateSpeed: () => Promise<void>;
  calculateDamage: () => Promise<void>;
  calculateSurvival: () => Promise<void>;
  initialize: () => Promise<void>;
  reset: () => void;
}

const defaultNature: NatureCompat = {
  name: "Serious",
  nameEs: "Fuerte",
  increasedStat: null,
  decreasedStat: null,
};

const defaultBuild: BuildCompat = {
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

const defaultObjective: ObjectiveCompat = {
  type: "speed",
  target: 168,
  stat: "speed",
};

type ExecutableUseCase = { execute: (input: unknown) => Promise<unknown> };

export const useOptimizerStore = create<OptimizerState>((set, get) => ({
  problem: null,
  buildConfig: null,
  optimizationType: "speed",
  result: null,
  isCalculating: false,
  error: null,
  isInitialized: false,
  build: defaultBuild,
  objective: defaultObjective,
  results: { speed: null, damage: null, survival: null },
  errors: { speed: null, damage: null, survival: null },
  status: { speed: "Idle", damage: "Idle", survival: "Idle" },
  activeTab: "speed",

  setProblem: (problem) => set({ problem }),
  setBuildConfig: (buildConfig) => set({ buildConfig }),
  setOptimizationType: (optimizationType) =>
    set({ optimizationType, activeTab: optimizationType }),

  setBuild: (patch) =>
    set((state) => {
      const next = { ...state.build } as BuildCompat;
      if (patch.pokemonId !== undefined) next.pokemonId = patch.pokemonId;
      if (patch.evsActuales) {
        const ev = patch.evsActuales;
        if (ev instanceof EVDistribution) next.evsActuales = ev;
        else next.evsActuales = createEV(ev as Record<string, number>);
      }
      if (patch.fijos) {
        const natPatch = patch.fijos.naturaleza;
        let nextNature = next.fijos.naturaleza;
        if (natPatch) {
          if (typeof natPatch === "string") {
            nextNature = {
              name: natPatch,
              nameEs: natPatch,
              increasedStat: null,
              decreasedStat: null,
            };
          } else {
            const np = natPatch as Partial<NatureCompat>;
            nextNature = {
              name: np.name ?? next.fijos.naturaleza.name,
              nameEs: np.nameEs ?? next.fijos.naturaleza.nameEs,
              increasedStat:
                np.increasedStat ?? next.fijos.naturaleza.increasedStat ?? null,
              decreasedStat:
                np.decreasedStat ?? next.fijos.naturaleza.decreasedStat ?? null,
            };
          }
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
        if (ctx.generation === undefined) ctx.generation = ctx.generacion;
        if (ctx.generacion === undefined) ctx.generacion = ctx.generation;
        next.contexto = ctx;
      }
      return { build: next, buildConfig: next };
    }),

  setObjective: (objective) =>
    set({
      objective,
      optimizationType: objective.type as TabId,
      activeTab: objective.type as TabId,
      problem: objective,
    }),
  setActiveTab: (activeTab) => set({ activeTab, optimizationType: activeTab }),

  calculate: async () => {
    const { build, objective, activeTab } = get();
    const tab = activeTab;
    set((s) => ({
      isCalculating: true,
      status: { ...s.status, [tab]: "Calculating" as const },
      errors: { ...s.errors, [tab]: null },
    }));
    try {
      await container.init();
      let result: unknown = null;
      const evRecord =
        (
          build.evsActuales as unknown as {
            getAll?: () => Record<string, number>;
            toRecord?: () => Record<string, number>;
          }
        ).getAll?.() ??
        (
          build.evsActuales as unknown as {
            toRecord?: () => Record<string, number>;
          }
        ).toRecord?.() ??
        build.evsActuales;
      if (objective.type === "speed") {
        const uc = container.getOptimizeSpeedUseCase() as
          | ExecutableUseCase
          | ((input: unknown) => Promise<unknown>)
          | null;
        if (uc && typeof (uc as ExecutableUseCase).execute === "function") {
          result = await (uc as ExecutableUseCase).execute({
            pokemonId: build.pokemonId,
            evs: evRecord,
            target: (objective as { target: number }).target,
            nature: build.fijos.naturaleza,
            ivs: build.fijos.ivs,
            level: build.contexto.nivel,
            generation: build.contexto.generacion,
          });
        } else if (typeof uc === "function") {
          result = await (uc as (input: unknown) => Promise<unknown>)({
            pokemonId: build.pokemonId,
            target: (objective as { target: number }).target,
          });
        }
      } else if (objective.type === "damage") {
        const uc = container.getOptimizeDamageUseCase() as
          | ExecutableUseCase
          | ((input: unknown) => Promise<unknown>)
          | null;
        if (uc && typeof (uc as ExecutableUseCase).execute === "function")
          result = await (uc as ExecutableUseCase).execute(build);
        else if (typeof uc === "function")
          result = await (uc as (input: unknown) => Promise<unknown>)(build);
      } else {
        const uc = container.getOptimizeSurvivalUseCase() as
          | ExecutableUseCase
          | ((input: unknown) => Promise<unknown>)
          | null;
        if (uc && typeof (uc as ExecutableUseCase).execute === "function")
          result = await (uc as ExecutableUseCase).execute(build);
        else if (typeof uc === "function")
          result = await (uc as (input: unknown) => Promise<unknown>)(build);
      }
      const res = result as {
        solution?: unknown;
        evs?: unknown;
        achievedStat?: number;
        achieved?: number;
        achievedPercent?: number;
        totalEVs?: number;
        total?: number;
        explanation?: { evidence: string[]; summary: string };
      };
      const mappedResults: ResultsCompat = { ...get().results };
      if (objective.type === "speed") {
        mappedResults.speed = {
          solution: (res?.solution ?? res?.evs ?? 0) as number,
          achievedStat: (res?.achievedStat ?? res?.achieved ?? 0) as number,
          target: (objective as { target: number }).target,
          explanation: res?.explanation ?? {
            evidence: ["Cálculo completado"],
            summary: "Óptimo",
          },
        };
      } else if (objective.type === "damage") {
        mappedResults.damage = {
          solution: (res?.solution ?? 0) as number,
          achievedPercent: (res?.achievedPercent ?? 0) as number,
          target: (objective as { targetPercent: number }).targetPercent ?? 100,
          explanation: res?.explanation,
        };
      } else {
        mappedResults.survival = {
          solution: (res?.solution ?? null) as {
            hp: number;
            defense?: number;
            specialDefense?: number;
          } | null,
          totalEVs: (res?.totalEVs ?? res?.total ?? 0) as number,
          explanation: res?.explanation,
        };
      }
      set({
        result,
        results: mappedResults,
        isCalculating: false,
        status: { ...get().status, [tab]: "Done" as const },
        isInitialized: true,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const tab = get().activeTab;
      set((s) => ({
        error: msg,
        isCalculating: false,
        errors: { ...s.errors, [tab]: msg },
        status: { ...s.status, [tab]: "Error" as const },
      }));
    }
  },

  calculateSpeed: async () => {
    set({ activeTab: "speed", optimizationType: "speed" });
    return get().calculate();
  },
  calculateDamage: async () => {
    set({ activeTab: "damage", optimizationType: "damage" });
    return get().calculate();
  },
  calculateSurvival: async () => {
    set({ activeTab: "survival", optimizationType: "survival" });
    return get().calculate();
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
      result: null,
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
  const calculateSpeed = useOptimizerStore((s) => s.calculateSpeed);
  return {
    setBuild,
    setObjective,
    setActiveTab,
    calculate,
    calculateSpeed,
    calculateDamage: useOptimizerStore.getState().calculateDamage,
    calculateSurvival: useOptimizerStore.getState().calculateSurvival,
  };
};

export default useOptimizerStore;
