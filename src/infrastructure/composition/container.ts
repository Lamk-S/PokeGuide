import { battleComposition } from "./battle.composition";

export const container = {
  getCalculateBattleScenarioUseCase: () =>
    battleComposition.calculateBattleScenarioUseCase,
  getPokemonRepository: () => battleComposition.pokemonRepository,
  getMoveRepository: () => battleComposition.moveRepository,
  getItemRepository: () => battleComposition.itemRepository,
  getAbilityRepository: () => battleComposition.abilityRepository,
  getCalculatorAdapter: () => battleComposition.calculatorAdapter,
} as const;
