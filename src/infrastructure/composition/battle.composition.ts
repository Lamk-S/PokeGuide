import { LocalAbilityRepository } from "@/infrastructure/local-data/repositories/local-ability.repository";
import { LocalItemRepository } from "@/infrastructure/local-data/repositories/local-item.repository";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { SmogonCalculatorAdapter } from "@/infrastructure/battle/smogon/SmogonCalculatorAdapter";
import { PokemonBaseProviderAdapter } from "@/infrastructure/battle/PokemonBaseProviderAdapter";
import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";

export const abilityRepository = new LocalAbilityRepository();
export const itemRepository = new LocalItemRepository();
export const moveRepository = new LocalMoveRepository();
export const pokemonRepository = new LocalPokemonRepository();

export const baseProvider = new PokemonBaseProviderAdapter(pokemonRepository);
export const calculator = new SmogonCalculatorAdapter();
export const calculateBattleScenarioUseCase =
  new CalculateBattleScenarioUseCase(baseProvider, calculator);

export const battleComposition = {
  abilityRepository,
  itemRepository,
  moveRepository,
  pokemonRepository,
  baseProvider,
  calculator,
  calculateBattleScenarioUseCase,
};

export type BattleComposition = typeof battleComposition;
