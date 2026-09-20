import type { PokemonId } from "@/domain/pokemon/types/pokemon";

type PokemonRef = { id: PokemonId; name: string };

export const SpriteResolver = {
  normalize(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/['.:]/g, "");
  },

  getSpriteChain(pokemon: PokemonRef, _hd?: boolean): string[] {
    const id = pokemon.id;

    return [
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      "/placeholder-sprite.png",
    ];
  },
} as const;
