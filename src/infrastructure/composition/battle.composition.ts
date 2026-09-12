import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";

export interface BattleComposition {
  pokemonRepository: LocalPokemonRepository;
  moveRepository: LocalMoveRepository;
  calculatorAdapter: SmogonCalculatorAdapter;
  calculateBattleScenarioUseCase: CalculateBattleScenarioUseCase;
}

export function createBattleComposition(): BattleComposition {
  const pokemonRepository = new LocalPokemonRepository();
  const moveRepository = new LocalMoveRepository();
  const calculatorAdapter = new SmogonCalculatorAdapter();
  const calculateBattleScenarioUseCase = new CalculateBattleScenarioUseCase(
    pokemonRepository,
    calculatorAdapter,
  );
  return {
    pokemonRepository,
    moveRepository,
    calculatorAdapter,
    calculateBattleScenarioUseCase,
  };
}

export const battleComposition = createBattleComposition();
export const {
  pokemonRepository,
  moveRepository,
  calculatorAdapter,
  calculateBattleScenarioUseCase,
} = battleComposition;
