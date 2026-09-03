import type { PokemonRepository } from "@/domain/pokemon/repositories/pokemon-repository";
import type { PokemonId } from "@/domain/pokemon/types/pokemon";

// Caso de uso orquestador, independiente del framework UI
export class GetPokemonById {
  constructor(private readonly repository: PokemonRepository) {}

  async execute(id: PokemonId) {
    // Aquí a futuro se pueden añadir validaciones o caché a nivel de aplicación
    const pokemon = await this.repository.getById(id);
    if (!pokemon) throw new Error(`Pokémon con ID ${id} no encontrado.`);
    return pokemon;
  }
}
