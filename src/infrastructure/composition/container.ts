import { LocalPokemonRepository } from "../local-data/repositories/local-pokemon.repository";
import { LocalMoveRepository } from "../local-data/repositories/local-move.repository";
import { LocalItemRepository } from "../local-data/repositories/local-item.repository";
import { LocalAbilityRepository } from "../local-data/repositories/local-ability.repository";

export const container = {
  pokemon: new LocalPokemonRepository(),
  moves: new LocalMoveRepository(),
  items: new LocalItemRepository(),
  abilities: new LocalAbilityRepository(),
};

export { container as default };
