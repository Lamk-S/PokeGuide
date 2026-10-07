import { battleComposition } from "./battle.composition";

export const container = {
  battle: battleComposition,
  getPokemonRepository: () => battleComposition.pokemonRepository,
  getAbilityRepository: () => battleComposition.abilityRepository,
  getItemRepository: () => battleComposition.itemRepository,
  getMoveRepository: () => battleComposition.moveRepository,
  getBattleCalculator: () => battleComposition.calculator,
  getBattleUseCase: () => battleComposition.calculateBattleScenarioUseCase,
} as const;

export type Container = typeof container;
