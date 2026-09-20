import type { PokemonId } from "@/domain/pokemon/types/pokemon";
import { SpriteResolver } from "@/infrastructure/pokemon/SpriteResolver";

type PokemonRef = { id: PokemonId; name: string };

export const ShowdownSpriteResolver = {
  normalize(n: string): string {
    return SpriteResolver.normalize(n);
  },

  getUrl(ref: PokemonRef): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${ref.id}.png`;
  },

  getFallbackChain(ref: PokemonRef): string[] {
    return SpriteResolver.getSpriteChain(ref);
  },
} as const;
