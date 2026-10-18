"use client";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { NATURES } from "@/domain/stats/constants/natures";
import { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";
import { OptimizationProblem } from "@/domain/optimization/entities/OptimizationProblem";
import { optimizeSpeed } from "@/domain/optimization/services/SpeedOptimizer";
import { optimizeDamage } from "@/domain/optimization/services/DamageOptimizer";
import { optimizeSurvival } from "@/domain/optimization/services/SurvivalOptimizer";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import type {
  Objective,
  DamageObjective,
  SurvivalObjective,
  SpeedObjective,
} from "@/domain/optimization/value-objects/Objective";
import type { Nature } from "@/domain/optimization/entities/BuildConfiguration";
import type {
  StatName,
  DefenseStat,
  OffensiveStat,
  SpeedOptimizationResult,
  DamageOptimizationResult,
  SurvivalOptimizationResult,
  OptimizationStatus,
} from "@/domain/optimization/types/OptimizationTypes";

type PokemonRepoItem = { baseStats: Record<StatName, number> };

type OperationState = { status: OptimizationStatus; requestId: number };
type Operations = {
  speed: OperationState;
  damage: OperationState;
  survival: OperationState;
};
type Errors = {
  speed: string | null;
  damage: string | null;
  survival: string | null;
};
type Results = {
  speed: SpeedOptimizationResult | null;
  damage: DamageOptimizationResult | null;
  survival: SurvivalOptimizationResult | null;
};
type BuildState = {
  pokemonId: number;
  contexto: { generacion: number; formato: string; nivel: number };
  fijos: {
    naturaleza: Nature;
    ivs: Record<StatName, number>;
    movimientos: string[];
    habilidad?: string;
    objeto?: string;
  };
  evsActuales: EVDistribution;
};

type BuildPatch = Partial<BuildState> & {
  contexto?: Partial<BuildState["contexto"]>;
  fijos?: Partial<BuildState["fijos"]>;
};

const defaultNature = NATURES.find(
  (n) => n.name === "Hardy",
) as unknown as Nature;
const defaultIVs: Record<StatName, number> = {
  hp: 31,
  attack: 31,
  defense: 31,
  "special-attack": 31,
  "special-defense": 31,
  speed: 31,
};
const IDLE: OptimizationStatus = "Idle";
const CALCULATING: OptimizationStatus = "Calculating";

const pokemonRepo = new LocalPokemonRepository();
const calculator = new SmogonCalculatorAdapter();
let repoInit = false;

async function ensureRepos() {
  if (!repoInit) {
    await pokemonRepo.init().catch(() => {});
    repoInit = true;
  }
}

async function getBaseStats(id: number): Promise<Record<StatName, number>> {
  await ensureRepos();
  const p = await pokemonRepo.getById(id);
  if (!p) throw new Error(`Pokémon ${id} no encontrado`);
  const typed = p as unknown as PokemonRepoItem;
  const raw = typed.baseStats as Record<string, number | undefined>;
  const out = {} as Record<StatName, number>;
  const required: StatName[] = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];
  for (const s of required) {
    const v = raw[s];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) {
      throw new Error(`baseStat ${s} faltante para ${id}`);
    }
    out[s] = v;
  }
  return out;
}

type State = {
  build: BuildState;
  objective: Objective;
  activeTab: "speed" | "damage" | "survival";
  operations: Operations;
  results: Results;
  errors: Errors;
  setBuild: (p: BuildPatch | ((prev: BuildState) => BuildState)) => void;
  setObjective: (o: Objective) => void;
  setActiveTab: (t: State["activeTab"]) => void;
  setSpeedForm: (
    p: Partial<{
      pokemonId: number | null;
      nature: Nature;
      level: number;
      targetSpeed: number;
    }>,
  ) => void;
  setDamageForm: (
    p: Partial<{
      attackerId: number | null;
      defenderId: number | null;
      moveId: string;
      moveName: string;
      level: number;
      nature: Nature;
      offensiveStat: OffensiveStat;
      targetPercent: number;
    }>,
  ) => void;
  setSurvivalForm: (
    p: Partial<{
      defenderId: number | null;
      attackerId: number | null;
      moveId: string;
      moveName: string;
      level: number;
      nature: Nature;
      defenseStat: DefenseStat;
    }>,
  ) => void;
  calculateSpeed: () => Promise<void>;
  calculateDamage: () => Promise<void>;
  calculateSurvivalBattle: () => Promise<void>;
  reset: (tab?: State["activeTab"]) => void;
};

export const useOptimizerStore = create<State>((set, get) => ({
  build: {
    pokemonId: 0,
    contexto: { generacion: 9, formato: "gen9ou", nivel: 50 },
    fijos: { naturaleza: defaultNature, ivs: defaultIVs, movimientos: [] },
    evsActuales: EVDistribution.empty(),
  },
  objective: { type: "speed", target: 168, stat: "speed" },
  activeTab: "speed",
  operations: {
    speed: { status: IDLE, requestId: 0 },
    damage: { status: IDLE, requestId: 0 },
    survival: { status: IDLE, requestId: 0 },
  },
  results: { speed: null, damage: null, survival: null },
  errors: { speed: null, damage: null, survival: null },

  setBuild: (patch) =>
    set((s) => {
      const prev = s.build;
      const next =
        typeof patch === "function"
          ? (patch as (prev: BuildState) => BuildState)(prev)
          : ({
              ...prev,
              ...(patch as BuildPatch),
              contexto: {
                ...prev.contexto,
                ...((patch as BuildPatch).contexto ?? {}),
              },
              fijos: { ...prev.fijos, ...((patch as BuildPatch).fijos ?? {}) },
            } as BuildState);
      const changed =
        next.pokemonId !== prev.pokemonId ||
        next.contexto.nivel !== prev.contexto.nivel ||
        next.contexto.generacion !== prev.contexto.generacion ||
        next.fijos.naturaleza.name !== prev.fijos.naturaleza.name ||
        !next.evsActuales.equals(prev.evsActuales);
      if (!changed) return { build: next };
      return {
        build: next,
        results: { ...s.results, speed: null, damage: null, survival: null },
        errors: { ...s.errors, speed: null, damage: null, survival: null },
      };
    }),

  setObjective: (obj) =>
    set((s) => {
      const newResults = { ...s.results };
      const newErrors = { ...s.errors };
      if (obj.type === "speed") {
        newResults.speed = null;
        newErrors.speed = null;
      }
      if (obj.type === "damage") {
        newResults.damage = null;
        newErrors.damage = null;
      }
      if (obj.type === "survival") {
        newResults.survival = null;
        newErrors.survival = null;
      }
      const same = s.objective.type === obj.type;
      if (!same)
        return {
          objective: obj,
          activeTab: obj.type,
          results: newResults,
          errors: newErrors,
        };
      return { objective: obj, results: newResults, errors: newErrors };
    }),

  setActiveTab: (tab) =>
    set((s) => {
      let newObj: Objective = s.objective;
      if (s.objective.type !== tab) {
        if (tab === "speed") {
          const next: SpeedObjective = {
            type: "speed",
            target: 168,
            stat: "speed",
          };
          newObj = next;
        } else if (tab === "damage") {
          const next: DamageObjective = {
            type: "damage",
            targetPercent: 100,
            offensiveStat: "attack",
            moveId: "",
            defenderId: 0,
          };
          newObj = next;
        } else {
          const next: SurvivalObjective = {
            type: "survival",
            defenseStat: "defense",
            moveId: "",
            attackerId: 0,
          };
          newObj = next;
        }
      }
      return { activeTab: tab, objective: newObj };
    }),

  setSpeedForm: (f) => {
    const s = get();
    if (f.pokemonId !== undefined)
      set({ build: { ...s.build, pokemonId: f.pokemonId ?? 0 } });
    if (f.nature !== undefined)
      set({
        build: {
          ...s.build,
          fijos: { ...s.build.fijos, naturaleza: f.nature },
        },
      });
    if (f.level !== undefined)
      set({
        build: {
          ...s.build,
          contexto: { ...s.build.contexto, nivel: f.level },
        },
      });
    if (f.targetSpeed !== undefined) {
      const next: SpeedObjective = {
        type: "speed",
        target: f.targetSpeed,
        stat: "speed",
      };
      set({ objective: next });
    }
  },

  setDamageForm: (f) => {
    const s = get();
    let nb = s.build;
    let no = s.objective;
    if (f.attackerId !== undefined)
      nb = { ...nb, pokemonId: f.attackerId ?? 0 };
    if (f.nature !== undefined)
      nb = { ...nb, fijos: { ...nb.fijos, naturaleza: f.nature } };
    if (f.level !== undefined)
      nb = { ...nb, contexto: { ...nb.contexto, nivel: f.level } };
    if (no.type === "damage") {
      no = {
        ...no,
        targetPercent: f.targetPercent ?? no.targetPercent,
        offensiveStat: f.offensiveStat ?? no.offensiveStat,
        moveId: f.moveId ?? no.moveId,
        defenderId: f.defenderId ?? no.defenderId,
      };
    } else {
      const next: DamageObjective = {
        type: "damage",
        targetPercent: f.targetPercent ?? 100,
        offensiveStat: f.offensiveStat ?? "attack",
        moveId: f.moveId ?? "",
        defenderId: f.defenderId ?? 0,
      };
      no = next;
    }
    set({ build: nb, objective: no, activeTab: "damage" });
  },

  setSurvivalForm: (f) => {
    const s = get();
    let nb = s.build;
    let no = s.objective;
    if (f.defenderId !== undefined)
      nb = { ...nb, pokemonId: f.defenderId ?? 0 };
    if (f.nature !== undefined)
      nb = { ...nb, fijos: { ...nb.fijos, naturaleza: f.nature } };
    if (f.level !== undefined)
      nb = { ...nb, contexto: { ...nb.contexto, nivel: f.level } };
    if (no.type === "survival") {
      no = {
        ...no,
        defenseStat: f.defenseStat ?? no.defenseStat,
        moveId: f.moveId ?? no.moveId,
        attackerId: f.attackerId ?? no.attackerId,
      };
    } else {
      const next: SurvivalObjective = {
        type: "survival",
        defenseStat: f.defenseStat ?? "defense",
        moveId: f.moveId ?? "",
        attackerId: f.attackerId ?? 0,
      };
      no = next;
    }
    set({ build: nb, objective: no, activeTab: "survival" });
  },

  calculateSpeed: async () => {
    const { build, objective, operations } = get();
    if (objective.type !== "speed") {
      set({ errors: { ...get().errors, speed: "Objetivo no es velocidad" } });
      return;
    }
    if (!build.pokemonId) {
      set({ errors: { ...get().errors, speed: "Selecciona Pokémon" } });
      return;
    }
    const req = operations.speed.requestId + 1;
    set({
      operations: {
        ...operations,
        speed: { status: CALCULATING, requestId: req },
      },
      errors: { ...get().errors, speed: null },
    });
    try {
      const baseStats = await getBaseStats(build.pokemonId);
      const problem = new OptimizationProblem(
        { type: "ev_investment", direction: "minimize" },
        [{ variable: "speed", operator: "gte", target: objective.target }],
        {
          baseStats,
          ivs: build.fijos.ivs,
          level: build.contexto.nivel,
          nature: build.fijos.naturaleza,
          generation: build.contexto.generacion,
          currentEVs: build.evsActuales.getAll(),
        },
      );
      const result = optimizeSpeed(problem);
      if (get().operations.speed.requestId !== req) return;
      set({
        results: { ...get().results, speed: result },
        operations: {
          ...get().operations,
          speed: { status: result.status, requestId: req },
        },
      });
    } catch (e) {
      if (get().operations.speed.requestId !== req) return;
      set({
        errors: {
          ...get().errors,
          speed: e instanceof Error ? e.message : "Error",
        },
        operations: {
          ...get().operations,
          speed: { status: IDLE, requestId: req },
        },
      });
    }
  },

  calculateDamage: async () => {
    const { build, objective, operations } = get();
    if (objective.type !== "damage") {
      set({ errors: { ...get().errors, damage: "Objetivo no es daño" } });
      return;
    }
    if (!build.pokemonId || !objective.defenderId || !objective.moveId) {
      set({
        errors: {
          ...get().errors,
          damage: "Faltan atacante/defensor/movimiento",
        },
      });
      return;
    }
    const req = operations.damage.requestId + 1;
    set({
      operations: {
        ...operations,
        damage: { status: CALCULATING, requestId: req },
      },
      errors: { ...get().errors, damage: null },
    });
    try {
      const [atkBase, defBase] = await Promise.all([
        getBaseStats(build.pokemonId),
        getBaseStats(objective.defenderId),
      ]);
      const evaluator = (offEV: number) => {
        try {
          const atkEVs = {
            ...build.evsActuales.getAll(),
            [objective.offensiveStat]: offEV,
          } as Record<StatName, number>;
          const scenario = {
            generation: build.contexto.generacion,
            attacker: {
              id: build.pokemonId,
              level: build.contexto.nivel,
              nature: build.fijos.naturaleza,
              evs: atkEVs,
              ivs: build.fijos.ivs,
              baseStats: atkBase,
            },
            defender: {
              id: objective.defenderId,
              level: build.contexto.nivel,
              nature: {
                name: "Serious",
                nameEs: "Seria",
                increasedStat: null,
                decreasedStat: null,
              },
              evs: {
                hp: 0,
                attack: 0,
                defense: 0,
                "special-attack": 0,
                "special-defense": 0,
                speed: 0,
              },
              ivs: defaultIVs,
              baseStats: defBase,
            },
            moveName: objective.moveId,
            moveId: objective.moveId,
            conditions: { weather: "none", terrain: "none" },
          } as unknown as Parameters<typeof calculator.calculate>[0];
          const r = calculator.calculate(scenario);
          return r.damage.maxPercent ?? r.damage.minPercent ?? 0;
        } catch {
          return null;
        }
      };
      const problem = new OptimizationProblem(
        { type: "ev_investment", direction: "minimize" },
        [
          {
            variable: objective.offensiveStat,
            operator: "gte",
            target: objective.targetPercent,
          },
        ],
        {
          baseStats: atkBase,
          ivs: build.fijos.ivs,
          level: build.contexto.nivel,
          nature: build.fijos.naturaleza,
          generation: build.contexto.generacion,
          currentEVs: build.evsActuales.getAll(),
        },
      );
      const result = optimizeDamage(
        problem,
        evaluator,
        objective.offensiveStat,
      );
      if (get().operations.damage.requestId !== req) return;
      set({
        results: { ...get().results, damage: result },
        operations: {
          ...get().operations,
          damage: { status: result.status, requestId: req },
        },
      });
    } catch (e) {
      if (get().operations.damage.requestId !== req) return;
      set({
        errors: {
          ...get().errors,
          damage: e instanceof Error ? e.message : "Error daño",
        },
        operations: {
          ...get().operations,
          damage: { status: IDLE, requestId: req },
        },
      });
    }
  },

  calculateSurvivalBattle: async () => {
    const { build, objective, operations } = get();
    if (objective.type !== "survival") {
      set({
        errors: { ...get().errors, survival: "Objetivo no es supervivencia" },
      });
      return;
    }
    if (!build.pokemonId || !objective.attackerId || !objective.moveId) {
      set({
        errors: {
          ...get().errors,
          survival: "Faltan defensor/atacante/movimiento",
        },
      });
      return;
    }
    const req = operations.survival.requestId + 1;
    set({
      operations: {
        ...operations,
        survival: { status: CALCULATING, requestId: req },
      },
      errors: { ...get().errors, survival: null },
    });
    try {
      const [defBase, atkBase] = await Promise.all([
        getBaseStats(build.pokemonId),
        getBaseStats(objective.attackerId),
      ]);

      const evaluator = (hpEV: number, defEV: number) => {
        try {
          const defEVs: Record<StatName, number> = {
            hp: hpEV,
            attack: 0,
            defense: 0,
            "special-attack": 0,
            "special-defense": 0,
            speed: 0,
          };
          defEVs[objective.defenseStat] = defEV;

          const other = build.evsActuales.getAll();
          for (const k of Object.keys(other) as StatName[]) {
            if (k === "hp" || k === objective.defenseStat) continue;
            defEVs[k] = other[k];
          }

          const totalDef = Object.values(defEVs).reduce(
            (a, b) => a + (b as number),
            0,
          );
          if (totalDef > 510) return false;

          const atkEVs: Record<StatName, number> = {
            hp: 0,
            attack: 0,
            defense: 0,
            "special-attack": 0,
            "special-defense": 0,
            speed: 0,
          };
          if (objective.defenseStat === "defense") {
            atkEVs.attack = 252;
          } else {
            atkEVs["special-attack"] = 252;
          }

          const scenario = {
            generation: build.contexto.generacion,
            attacker: {
              id: objective.attackerId,
              level: build.contexto.nivel,
              nature: {
                name: "Modest",
                nameEs: "Modesta",
                increasedStat: "special-attack",
                decreasedStat: "attack",
              },
              evs: atkEVs,
              ivs: defaultIVs,
              baseStats: atkBase,
            },
            defender: {
              id: build.pokemonId,
              level: build.contexto.nivel,
              nature: build.fijos.naturaleza,
              evs: defEVs,
              ivs: build.fijos.ivs,
              baseStats: defBase,
            },
            moveName: objective.moveId,
            moveId: objective.moveId,
            conditions: { weather: "none", terrain: "none" },
          } as unknown as Parameters<typeof calculator.calculate>[0];

          const r = calculator.calculate(scenario);
          return r.damage.maxDamage < r.defenderMaxHp;
        } catch {
          return false;
        }
      };

      const problem = new OptimizationProblem(
        { type: "ev_investment", direction: "minimize" },
        [
          {
            variable:
              objective.defenseStat === "defense"
                ? "survival_physical"
                : "survival_special",
            operator: "gte",
            target: 1,
          },
        ],
        {
          baseStats: defBase,
          ivs: build.fijos.ivs,
          level: build.contexto.nivel,
          nature: build.fijos.naturaleza,
          generation: build.contexto.generacion,
          currentEVs: build.evsActuales.getAll(),
        },
      );

      const result = optimizeSurvival(
        problem,
        evaluator,
        objective.defenseStat,
      );
      if (get().operations.survival.requestId !== req) return;
      set({
        results: { ...get().results, survival: result },
        operations: {
          ...get().operations,
          survival: { status: result.status, requestId: req },
        },
      });
    } catch (e) {
      if (get().operations.survival.requestId !== req) return;
      set({
        errors: {
          ...get().errors,
          survival: e instanceof Error ? e.message : "Error supervivencia",
        },
        operations: {
          ...get().operations,
          survival: { status: IDLE, requestId: req },
        },
      });
    }
  },

  reset: (tab) => {
    if (!tab) {
      set({
        build: {
          pokemonId: 0,
          contexto: { generacion: 9, formato: "gen9ou", nivel: 50 },
          fijos: {
            naturaleza: defaultNature,
            ivs: defaultIVs,
            movimientos: [],
          },
          evsActuales: EVDistribution.empty(),
        },
        objective: { type: "speed", target: 168, stat: "speed" },
        activeTab: "speed",
        results: { speed: null, damage: null, survival: null },
        errors: { speed: null, damage: null, survival: null },
        operations: {
          speed: { status: IDLE, requestId: 0 },
          damage: { status: IDLE, requestId: 0 },
          survival: { status: IDLE, requestId: 0 },
        },
      });
    } else {
      set((s) => ({
        results: { ...s.results, [tab]: null },
        errors: { ...s.errors, [tab]: null },
        operations: {
          ...s.operations,
          [tab]: { status: IDLE, requestId: s.operations[tab].requestId + 1 },
        },
      }));
    }
  },
}));

export const useActiveTab = () => useOptimizerStore((s) => s.activeTab);
export const useBuild = () => useOptimizerStore((s) => s.build);
export const useObjective = () => useOptimizerStore((s) => s.objective);
export const useOptimizerResults = () => useOptimizerStore((s) => s.results);
export const useOptimizerErrors = () => useOptimizerStore((s) => s.errors);
export const useOptimizerStatus = () =>
  useOptimizerStore(
    useShallow((s) => ({
      speed: s.operations.speed.status,
      damage: s.operations.damage.status,
      survival: s.operations.survival.status,
    })),
  );
export const useIsCalculating = () =>
  useOptimizerStore((s) => s.operations[s.activeTab].status === "Calculating");
export const useOptimizerActions = () =>
  useOptimizerStore(
    useShallow((s) => ({
      setActiveTab: s.setActiveTab,
      setBuild: s.setBuild,
      setObjective: s.setObjective,
      setSpeedForm: s.setSpeedForm,
      setDamageForm: s.setDamageForm,
      setSurvivalForm: s.setSurvivalForm,
      calculateSpeed: s.calculateSpeed,
      calculateDamage: s.calculateDamage,
      calculateSurvivalBattle: s.calculateSurvivalBattle,
      reset: s.reset,
    })),
  );
export const useSpeedForm = () =>
  useOptimizerStore(
    useShallow((s) => ({
      pokemonId: s.build.pokemonId || null,
      nature: s.build.fijos.naturaleza,
      level: s.build.contexto.nivel,
      targetSpeed: s.objective.type === "speed" ? s.objective.target : 168,
      evs: s.build.evsActuales,
      ivs: s.build.fijos.ivs,
    })),
  );
export const useDamageForm = () =>
  useOptimizerStore(
    useShallow((s) => ({
      attackerId: s.build.pokemonId || null,
      defenderId: s.objective.type === "damage" ? s.objective.defenderId : null,
      moveId: s.objective.type === "damage" ? s.objective.moveId : "",
      moveName: s.objective.type === "damage" ? s.objective.moveId : "",
      level: s.build.contexto.nivel,
      nature: s.build.fijos.naturaleza,
      offensiveStat:
        s.objective.type === "damage"
          ? s.objective.offensiveStat
          : ("attack" as const),
      targetPercent:
        s.objective.type === "damage" ? s.objective.targetPercent : 100,
      evs: s.build.evsActuales,
    })),
  );
export const useSurvivalForm = () =>
  useOptimizerStore(
    useShallow((s) => ({
      defenderId: s.build.pokemonId || null,
      attackerId:
        s.objective.type === "survival" ? s.objective.attackerId : null,
      moveId: s.objective.type === "survival" ? s.objective.moveId : "",
      moveName: s.objective.type === "survival" ? s.objective.moveId : "",
      level: s.build.contexto.nivel,
      nature: s.build.fijos.naturaleza,
      defenseStat:
        s.objective.type === "survival"
          ? s.objective.defenseStat
          : ("defense" as const),
      evs: s.build.evsActuales,
    })),
  );
