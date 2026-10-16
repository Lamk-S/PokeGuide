"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type {
  StatName,
  SpeedOptimizationResult,
  SurvivalOptimizationResult,
  DefenseStat,
} from "@/domain/optimization/types/OptimizationTypes";
import { OptimizeSpeedUseCase } from "@/application/optimization/OptimizeSpeedUseCase";
import { OptimizeSurvivalUseCase } from "@/application/optimization/OptimizeSurvivalUseCase";

type Nature = {
  readonly name: string;
  readonly nameEs?: string;
  readonly increasedStat: StatName | null;
  readonly decreasedStat: StatName | null;
};
type BaseStats = Record<StatName, number>;
type IVs = Record<StatName, number>;
type EVs = Partial<Record<StatName, number>>;

interface SpeedFormState {
  pokemonId: number | null;
  pokemonName: string | null;
  baseStats: BaseStats | null;
  ivs: IVs;
  level: number;
  nature: Nature;
  generation: number;
  targetSpeed: number;
  currentEVs: EVs;
}
interface SurvivalFormState {
  pokemonId: number | null;
  pokemonName: string | null;
  baseStats: BaseStats | null;
  ivs: IVs;
  level: number;
  nature: Nature;
  generation: number;
  defenseStat: DefenseStat;
  attackerPokemonId: number | null;
  moveName: string | null;
  movePower: number;
}

interface OptimizerState {
  speedForm: SpeedFormState;
  survivalForm: SurvivalFormState;
  speedResult: SpeedOptimizationResult | null;
  survivalResult: SurvivalOptimizationResult | null;
  activeTab: "speed" | "survival";
  isCalculating: boolean;
  error: string | null;
  setActiveTab: (tab: "speed" | "survival") => void;
  setSpeedForm: (patch: Partial<SpeedFormState>) => void;
  setSurvivalForm: (patch: Partial<SurvivalFormState>) => void;
  calculateSpeed: () => void;
  calculateSurvival: (
    evaluator: (hpEV: number, defEV: number) => boolean,
  ) => void;
  resetSpeed: () => void;
  resetSurvival: () => void;
}

const defaultIVs: IVs = {
  hp: 31,
  attack: 31,
  defense: 31,
  "special-attack": 31,
  "special-defense": 31,
  speed: 31,
};
const defaultNature: Nature = {
  name: "Serious",
  nameEs: "Seria",
  increasedStat: null,
  decreasedStat: null,
};

const defaultSpeedForm: SpeedFormState = {
  pokemonId: null,
  pokemonName: null,
  baseStats: null,
  ivs: defaultIVs,
  level: 50,
  nature: defaultNature,
  generation: 9,
  targetSpeed: 168,
  currentEVs: {},
};
const defaultSurvivalForm: SurvivalFormState = {
  pokemonId: null,
  pokemonName: null,
  baseStats: null,
  ivs: defaultIVs,
  level: 50,
  nature: defaultNature,
  generation: 9,
  defenseStat: "defense",
  attackerPokemonId: null,
  moveName: null,
  movePower: 100,
};

const speedUC = new OptimizeSpeedUseCase();
const survivalUC = new OptimizeSurvivalUseCase();

export const useOptimizerStore = create<OptimizerState>()(
  devtools(
    (set, get) => ({
      speedForm: defaultSpeedForm,
      survivalForm: defaultSurvivalForm,
      speedResult: null,
      survivalResult: null,
      activeTab: "speed",
      isCalculating: false,
      error: null,

      setActiveTab: (tab) => set({ activeTab: tab, error: null }),
      setSpeedForm: (patch) =>
        set((s) => ({ speedForm: { ...s.speedForm, ...patch }, error: null })),
      setSurvivalForm: (patch) =>
        set((s) => ({
          survivalForm: { ...s.survivalForm, ...patch },
          error: null,
        })),

      calculateSpeed: () => {
        const { speedForm } = get();
        if (!speedForm.baseStats) {
          set({ error: "Selecciona un Pokémon (usa ID o Preset)" });
          return;
        }
        if (speedForm.targetSpeed <= 0) {
          set({ error: "Velocidad objetivo debe ser >0" });
          return;
        }
        set({ isCalculating: true, error: null });
        try {
          const result = speedUC.execute({
            baseStats: speedForm.baseStats,
            ivs: speedForm.ivs,
            level: speedForm.level,
            nature: speedForm.nature,
            generation: speedForm.generation,
            targetSpeed: speedForm.targetSpeed,
            currentEVs: speedForm.currentEVs,
          });
          set({ speedResult: result, isCalculating: false });
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : "Error en cálculo",
            isCalculating: false,
          });
        }
      },

      calculateSurvival: (evaluator) => {
        const { survivalForm } = get();
        if (!survivalForm.baseStats) {
          set({ error: "Selecciona un Pokémon defensor" });
          return;
        }
        set({ isCalculating: true, error: null });
        try {
          const result = survivalUC.execute(
            {
              baseStats: survivalForm.baseStats,
              ivs: survivalForm.ivs,
              level: survivalForm.level,
              nature: survivalForm.nature,
              generation: survivalForm.generation,
              defenseStat: survivalForm.defenseStat,
              currentEVs: {},
            },
            evaluator,
            survivalForm.defenseStat,
          );
          set({ survivalResult: result, isCalculating: false });
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : "Error en cálculo",
            isCalculating: false,
          });
        }
      },

      resetSpeed: () =>
        set({ speedForm: defaultSpeedForm, speedResult: null, error: null }),
      resetSurvival: () =>
        set({
          survivalForm: defaultSurvivalForm,
          survivalResult: null,
          error: null,
        }),
    }),
    { name: "optimizer-store" },
  ),
);

export const useSpeedForm = () => useOptimizerStore((s) => s.speedForm);
export const useSurvivalForm = () => useOptimizerStore((s) => s.survivalForm);
export const useSpeedResult = () => useOptimizerStore((s) => s.speedResult);
export const useSurvivalResult = () =>
  useOptimizerStore((s) => s.survivalResult);
export const useActiveTab = () => useOptimizerStore((s) => s.activeTab);
export const useIsCalculating = () => useOptimizerStore((s) => s.isCalculating);
export const useOptimizerError = () => useOptimizerStore((s) => s.error);
export const useOptimizerActions = () =>
  useOptimizerStore(
    useShallow((s) => ({
      setActiveTab: s.setActiveTab,
      setSpeedForm: s.setSpeedForm,
      setSurvivalForm: s.setSurvivalForm,
      calculateSpeed: s.calculateSpeed,
      calculateSurvival: s.calculateSurvival,
      resetSpeed: s.resetSpeed,
      resetSurvival: s.resetSurvival,
    })),
  );
