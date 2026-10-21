import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { AnalyzeTeamUseCase } from "@/application/team/AnalyzeTeamUseCase";
import { CompareGenerationsUseCase } from "@/application/generations/CompareGenerationsUseCase";
import { PlanBreedingUseCase } from "@/application/breeding/PlanBreedingUseCase";
import { CalculatePokemonStats } from "@/application/stats/CalculatePokemonStats";
import { OptimizeBuildUseCase } from "@/application/optimization/OptimizeBuildUseCase";
import { OptimizeSpeedUseCase } from "@/application/optimization/OptimizeSpeedUseCase";
import { OptimizeSurvivalUseCase } from "@/application/optimization/OptimizeSurvivalUseCase";
import { OptimizeDamageUseCase } from "@/application/optimization/OptimizeDamageUseCase";
import { OptimizeSurvivalWithBattleUseCase } from "@/application/optimization/OptimizeSurvivalWithBattleUseCase";

type ContainerState = "idle" | "initializing" | "ready" | "failed";

type RepositoryLike = {
  init: () => Promise<void>;
  getAll?: () => Promise<unknown[]>;
  findAll?: () => Promise<unknown[]>;
  getById?: (id: number) => Promise<unknown>;
  getGroupedByType?: () => Promise<Record<string, unknown[]>>;
};

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

  private optimizeBuildUseCase!: unknown;
  private optimizeSpeedUseCase!: unknown;
  private optimizeSurvivalUseCase!: unknown;
  private optimizeDamageUseCase!: unknown;
  private optimizeSurvivalWithBattleUseCase!: unknown;

  private constructor() {}

  static getInstance(): CompositionContainer {
    if (!CompositionContainer.instance)
      CompositionContainer.instance = new CompositionContainer();
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
          this.pokemonRepository as unknown as never,
        );
        this.battleCalculator = new SmogonCalculatorAdapter();
        this.calculateBattleScenarioUseCase =
          new CalculateBattleScenarioUseCase(
            this.pokemonBaseProvider as unknown as never,
            this.battleCalculator as unknown as never,
          );
        this.analyzeTeamUseCase = new AnalyzeTeamUseCase();
        this.compareGenerationsUseCase = new CompareGenerationsUseCase();
        this.planBreedingUseCase = new PlanBreedingUseCase();
        this.calculatePokemonStatsUseCase = new CalculatePokemonStats();

        const tryCreate = (Ctor: unknown, ...args: unknown[]): unknown => {
          try {
            const ctor = Ctor as {
              prototype?: { execute?: unknown };
              new (...a: unknown[]): unknown;
            };
            if (typeof ctor === "function" && ctor.prototype?.execute)
              return new ctor(...args);
            return Ctor;
          } catch {
            return Ctor;
          }
        };
        this.optimizeBuildUseCase = tryCreate(OptimizeBuildUseCase);
        this.optimizeSpeedUseCase = tryCreate(OptimizeSpeedUseCase);
        this.optimizeSurvivalUseCase = tryCreate(OptimizeSurvivalUseCase);
        this.optimizeDamageUseCase = tryCreate(OptimizeDamageUseCase);
        this.optimizeSurvivalWithBattleUseCase = tryCreate(
          OptimizeSurvivalWithBattleUseCase,
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
    if (this.state !== "ready")
      throw new Error(`Container not ready. State=${this.state}.`);
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
  getOptimizeBuildUseCase(): unknown {
    this.ensureReady();
    return this.optimizeBuildUseCase;
  }
  getOptimizeSpeedUseCase(): unknown {
    this.ensureReady();
    return this.optimizeSpeedUseCase;
  }
  getOptimizeSurvivalUseCase(): unknown {
    this.ensureReady();
    return this.optimizeSurvivalUseCase;
  }
  getOptimizeDamageUseCase(): unknown {
    this.ensureReady();
    return this.optimizeDamageUseCase;
  }
  getOptimizeSurvivalWithBattleUseCase(): unknown {
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

  get pokemon(): RepositoryLike {
    this.ensureReady();
    const repo = this.pokemonRepository as unknown as RepositoryLike;
    return {
      init: () => repo.init(),
      getAll: () => repo.getAll?.() ?? repo.findAll?.() ?? Promise.resolve([]),
      getById: (id: number) => repo.getById?.(id) ?? Promise.resolve(undefined),
    };
  }
  get moves(): RepositoryLike {
    this.ensureReady();
    const repo = this.moveRepository as unknown as RepositoryLike;
    return {
      init: () => repo.init(),
      getAll: () => repo.getAll?.() ?? repo.findAll?.() ?? Promise.resolve([]),
      getGroupedByType: () => repo.getGroupedByType?.() ?? Promise.resolve({}),
    };
  }
  get abilities(): RepositoryLike {
    this.ensureReady();
    const repo = this.abilityRepository as unknown as RepositoryLike;
    return {
      init: () => repo.init(),
      getAll: () => repo.getAll?.() ?? Promise.resolve([]),
    };
  }
  get items(): RepositoryLike {
    this.ensureReady();
    const repo = this.itemRepository as unknown as RepositoryLike;
    return {
      init: () => repo.init(),
      getAll: () => repo.getAll?.() ?? Promise.resolve([]),
    };
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
