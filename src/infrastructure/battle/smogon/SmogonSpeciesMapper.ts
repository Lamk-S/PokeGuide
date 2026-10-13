import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import type { PokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";

type MapperInput = string | { id: number; name: string };

export class SmogonSpeciesMapper {
  static resolve(input: MapperInput, generation?: number): PokemonIdentity {
    if (typeof input === "string") {
      return parsePokemonIdentity(input, generation);
    }
    return parsePokemonIdentity({ id: input.id, name: input.name }, generation);
  }
  static map(input: MapperInput, generation?: number): PokemonIdentity {
    return SmogonSpeciesMapper.resolve(input, generation);
  }
  resolve(input: MapperInput, generation?: number): PokemonIdentity {
    return SmogonSpeciesMapper.resolve(input, generation);
  }
  map(input: MapperInput, generation?: number): PokemonIdentity {
    return SmogonSpeciesMapper.resolve(input, generation);
  }
}
