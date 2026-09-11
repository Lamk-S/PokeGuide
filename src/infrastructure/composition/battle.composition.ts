import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";

/**
 * Composition Root - Battle Lab
 * Centraliza el grafo de dependencias de la feature.
 * Presentación -> Aplicación -> Infraestructura
 * Nunca al revés.
 */
export interface BattleComposition {
  pokemonRepository: LocalPokemonRepository;
  calculatorAdapter: SmogonCalculatorAdapter;
  calculateBattleScenarioUseCase: CalculateBattleScenarioUseCase;
}

export function createBattleComposition(): BattleComposition {
  const pokemonRepository = new LocalPokemonRepository();
  const calculatorAdapter = new SmogonCalculatorAdapter();

  const calculateBattleScenarioUseCase = new CalculateBattleScenarioUseCase(
    pokemonRepository,
    calculatorAdapter,
  );

  return {
    pokemonRepository,
    calculatorAdapter,
    calculateBattleScenarioUseCase,
  };
}

// Singleton para producción - evita re-parsear el dataset y re-instanciar Smogon
export const battleComposition = createBattleComposition();

// Exports directos para DX limpia en los stores/features
export const {
  pokemonRepository,
  calculatorAdapter,
  calculateBattleScenarioUseCase,
} = battleComposition;
