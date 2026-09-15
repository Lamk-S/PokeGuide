import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";
import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";

export interface BattleComposition {
  pokemonRepository: LocalPokemonRepository;
  moveRepository: LocalMoveRepository;
  itemRepository: LocalItemRepository;
  abilityRepository: LocalAbilityRepository;
  calculatorAdapter: SmogonCalculatorAdapter;
  calculateBattleScenarioUseCase: CalculateBattleScenarioUseCase;
}

export function createBattleComposition(): BattleComposition {
  const pokemonRepository = new LocalPokemonRepository();
  const moveRepository = new LocalMoveRepository();
  const itemRepository = new LocalItemRepository();
  const abilityRepository = new LocalAbilityRepository();
  const calculatorAdapter = new SmogonCalculatorAdapter();
  const calculateBattleScenarioUseCase = new CalculateBattleScenarioUseCase(
    pokemonRepository,
    calculatorAdapter,
  );
  return {
    pokemonRepository,
    moveRepository,
    itemRepository,
    abilityRepository,
    calculatorAdapter,
    calculateBattleScenarioUseCase,
  };
}

export const battleComposition = createBattleComposition();
export const {
  pokemonRepository,
  moveRepository,
  itemRepository,
  abilityRepository,
  calculatorAdapter,
  calculateBattleScenarioUseCase,
} = battleComposition;
