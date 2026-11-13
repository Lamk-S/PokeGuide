import { CalculateBattleScenarioUseCase } from "@/application/battle/CalculateBattleScenarioUseCase";
import { PokemonBaseProviderAdapter } from "../battle/PokemonBaseProviderAdapter";
import { SmogonCalculatorAdapter } from "../battle/smogon/SmogonCalculatorAdapter";
import { LocalPokemonRepository } from "../local-data/repositories/local-pokemon.repository";

const pokemonRepo = new LocalPokemonRepository();
const provider = new PokemonBaseProviderAdapter(
  pokemonRepo as unknown as ConstructorParameters<
    typeof PokemonBaseProviderAdapter
  >[0],
);
const calculator = new SmogonCalculatorAdapter();
export const battleUseCase = new CalculateBattleScenarioUseCase(
  provider as never,
  calculator as never,
);
export async function ensureBattleDeps() {
  await pokemonRepo.init();
}
