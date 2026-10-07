import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type {
  IPokemonBaseProvider,
  IPokemonBaseData,
  StatSet,
} from "@/domain/battle/types/BattleParticipant";

export class PokemonBaseProviderAdapter implements IPokemonBaseProvider {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  async getBaseDataById(id: number): Promise<IPokemonBaseData | null> {
    const pokemon = await this.pokemonRepository.getById(id);
    if (!pokemon) return null;

    const raw = pokemon.baseStats;
    const statSet: StatSet = {
      hp: raw.hp,
      attack: raw.attack,
      defense: raw.defense,
      "special-attack": raw["special-attack"],
      "special-defense": raw["special-defense"],
      speed: raw.speed,
    };

    return {
      id: pokemon.id,
      name: pokemon.name,
      baseStats: statSet,
    };
  }
}
