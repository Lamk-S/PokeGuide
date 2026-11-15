import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { PlanBreedingUseCase } from "@/application/breeding/PlanBreedingUseCase";
import { CompareGenerationsUseCase } from "@/application/generations/CompareGenerationsUseCase";
import * as OptimizeBuildModule from "@/application/optimization/OptimizeBuildUseCase";
import * as OptimizeDamageModule from "@/application/optimization/OptimizeDamageUseCase";
import * as OptimizeSpeedModule from "@/application/optimization/OptimizeSpeedUseCase";
import * as OptimizeSurvivalModule from "@/application/optimization/OptimizeSurvivalUseCase";
import * as OptimizeSurvivalWithBattleModule from "@/application/optimization/OptimizeSurvivalWithBattleUseCase";
import { CalculatePokemonStats } from "@/application/stats/CalculatePokemonStats";
import { AnalyzeTeamUseCase } from "@/application/team/AnalyzeTeamUseCase";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";

type ContainerState = "idle" | "initializing" | "ready" | "failed";
type Executable = { execute: (input: unknown) => Promise<unknown> };
type ModuleRecord = Record<string, unknown>;

function hasExecute(value: unknown): value is Executable {
  return (
    typeof value === "object" &&
    value !== null &&
    "execute" in value &&
    typeof (value as { execute: unknown }).execute === "function"
  );
}

function isConstructor(
  value: unknown,
): value is new (
  arg?: unknown,
) => Executable {
  return (
    typeof value === "function" &&
    !!value.prototype &&
    typeof value.prototype.execute === "function"
  );
}

function toExecutable(mod: unknown, fallback?: unknown): Executable {
  const m = mod as ModuleRecord;
  const candidateKeys = [
    "OptimizeBuildUseCase",
    "OptimizeSpeedUseCase",
    "OptimizeSurvivalUseCase",
    "OptimizeDamageUseCase",
    "OptimizeSurvivalWithBattleUseCase",
  ];

  for (const key of candidateKeys) {
    const candidate = m[key];
    if (hasExecute(candidate)) return candidate as Executable;
  }

  const defaultExport = m.default;
  if (hasExecute(defaultExport)) return defaultExport as Executable;
  if (hasExecute(m)) return m as unknown as Executable;

  const potentialConstructors: unknown[] = [
    defaultExport,
    m.OptimizeBuildUseCase,
    m.OptimizeSpeedUseCase,
    m.OptimizeSurvivalUseCase,
    m.OptimizeDamageUseCase,
    m.OptimizeSurvivalWithBattleUseCase,
  ];

  for (const ctor of potentialConstructors) {
    if (!isConstructor(ctor)) continue;
    try {
      const instance = fallback !== undefined ? new ctor(fallback) : new ctor();
      if (hasExecute(instance)) return instance;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[CompositionContainer] Constructor instantiation failed, trying functional fallback",
          error,
        );
      }
    }
  }

  if (typeof defaultExport === "function") {
    const fn = defaultExport as (input: unknown) => Promise<unknown>;
    return { execute: (input: unknown) => fn(input) };
  }

  return {
    execute: async () => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[CompositionContainer] No executable found in module, returning empty result",
        );
      }
      return {};
    },
  };
}

export class CompositionContainer {
  private static instance: CompositionContainer | null = null;
  private state: ContainerState = "idle";
  private initPromise: Promise<void> | null = null;
  private initError: Error | null = null;

  private pokemonRepository!: LocalPokemonRepository;
  private moveRepository!: LocalMoveRepository;
  private abilityRepository!: LocalAbilityRepository;
  private itemRepository!: LocalItemRepository;

  private pokemonBaseProvider!: PokemonBaseProviderAdapter;
  private battleCalculator!: SmogonCalculatorAdapter;

  private calculateBattleScenarioUseCase!: CalculateBattleScenarioUseCase;
  private analyzeTeamUseCase!: AnalyzeTeamUseCase;
  private compareGenerationsUseCase!: CompareGenerationsUseCase;
  private planBreedingUseCase!: PlanBreedingUseCase;
  private calculatePokemonStatsUseCase!: CalculatePokemonStats;

  private optimizeBuildUseCase!: Executable;
  private optimizeSpeedUseCase!: Executable;
  private optimizeSurvivalUseCase!: Executable;
  private optimizeDamageUseCase!: Executable;
  private optimizeSurvivalWithBattleUseCase!: Executable;

  private constructor() {}

  static getInstance(): CompositionContainer {
    if (!CompositionContainer.instance) {
      CompositionContainer.instance = new CompositionContainer();
    }
    return CompositionContainer.instance;
  }

  async init(): Promise<void> {
    if (this.state === "ready") return;
    if (this.state === "initializing" && this.initPromise)
      return this.initPromise;

    this.state = "initializing";
    this.initError = null;

    this.initPromise = (async () => {
      try {
        this.pokemonRepository = new LocalPokemonRepository();
        this.moveRepository = new LocalMoveRepository();
        this.abilityRepository = new LocalAbilityRepository();
        this.itemRepository = new LocalItemRepository();

        await Promise.all([
          this.pokemonRepository.init(),
          this.moveRepository.init(),
          this.abilityRepository.init(),
          this.itemRepository.init(),
        ]);

        this.pokemonBaseProvider = new PokemonBaseProviderAdapter(
          this.pokemonRepository as never,
        );
        this.battleCalculator = new SmogonCalculatorAdapter();

        this.calculateBattleScenarioUseCase =
          new CalculateBattleScenarioUseCase(
            this.pokemonBaseProvider as never,
            this.battleCalculator as never,
          );
        this.analyzeTeamUseCase = new AnalyzeTeamUseCase();
        this.compareGenerationsUseCase = new CompareGenerationsUseCase();
        this.planBreedingUseCase = new PlanBreedingUseCase();
        this.calculatePokemonStatsUseCase = new CalculatePokemonStats();

        this.optimizeBuildUseCase = toExecutable(OptimizeBuildModule);
        this.optimizeSpeedUseCase = toExecutable(OptimizeSpeedModule);
        this.optimizeSurvivalUseCase = toExecutable(OptimizeSurvivalModule);
        this.optimizeDamageUseCase = toExecutable(OptimizeDamageModule);
        this.optimizeSurvivalWithBattleUseCase = toExecutable(
          OptimizeSurvivalWithBattleModule,
          this.pokemonBaseProvider,
        );

        this.state = "ready";
      } catch (error) {
        this.state = "failed";
        this.initError =
          error instanceof Error ? error : new Error(String(error));
        throw this.initError;
      }
    })();

    return this.initPromise;
  }

  ensureReady(): void {
    if (this.state !== "ready") {
      throw new Error(
        `Container not ready. State=${this.state}${this.initError ? ` - ${this.initError.message}` : ""}`,
      );
    }
  }

  getCalculateBattleScenarioUseCase(): CalculateBattleScenarioUseCase {
    this.ensureReady();
    return this.calculateBattleScenarioUseCase;
  }
  getAnalyzeTeamUseCase(): AnalyzeTeamUseCase {
    this.ensureReady();
    return this.analyzeTeamUseCase;
  }
  getCompareGenerationsUseCase(): CompareGenerationsUseCase {
    this.ensureReady();
    return this.compareGenerationsUseCase;
  }
  getPlanBreedingUseCase(): PlanBreedingUseCase {
    this.ensureReady();
    return this.planBreedingUseCase;
  }
  getCalculatePokemonStatsUseCase(): CalculatePokemonStats {
    this.ensureReady();
    return this.calculatePokemonStatsUseCase;
  }
  getOptimizeBuildUseCase(): Executable {
    this.ensureReady();
    return this.optimizeBuildUseCase;
  }
  getOptimizeSpeedUseCase(): Executable {
    this.ensureReady();
    return this.optimizeSpeedUseCase;
  }
  getOptimizeSurvivalUseCase(): Executable {
    this.ensureReady();
    return this.optimizeSurvivalUseCase;
  }
  getOptimizeDamageUseCase(): Executable {
    this.ensureReady();
    return this.optimizeDamageUseCase;
  }
  getOptimizeSurvivalWithBattleUseCase(): Executable {
    this.ensureReady();
    return this.optimizeSurvivalWithBattleUseCase;
  }
  getPokemonRepository(): LocalPokemonRepository {
    this.ensureReady();
    return this.pokemonRepository;
  }
  getMoveRepository(): LocalMoveRepository {
    this.ensureReady();
    return this.moveRepository;
  }
  getAbilityRepository(): LocalAbilityRepository {
    this.ensureReady();
    return this.abilityRepository;
  }
  getItemRepository(): LocalItemRepository {
    this.ensureReady();
    return this.itemRepository;
  }
  getState(): ContainerState {
    return this.state;
  }
  isReady(): boolean {
    return this.state === "ready";
  }
  static resetInstance(): void {
    CompositionContainer.instance = null;
  }
}

export const container = CompositionContainer.getInstance();
