import type { PokemonIdentity } from "../value-objects/PokemonIdentity";

export interface SpriteResolution {
  chain: string[];
  primaryKey: string;
  fallbackKeys: string[];
  identity: PokemonIdentity;
}

const SPECIES_FALLBACK_MAP: Record<string, number> = {
  zygarde: 718,
  absol: 359,
  charizard: 6,
  garchomp: 445,
  pikachu: 25,
  eternatus: 890,
  raichu: 26,
  cyclizar: 1005,
};

export function resolvePokemonSprite(
  identity: PokemonIdentity,
): SpriteResolution {
  const id = identity.numericId;
  const chain: string[] = [
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
  ];

  const baseId = SPECIES_FALLBACK_MAP[identity.speciesId];
  if (baseId && baseId !== id) {
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${baseId}.png`,
    );
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${baseId}.png`,
    );
  }

  chain.push("/placeholder-sprite.png");

  return {
    chain,
    primaryKey: `${id}`,
    fallbackKeys: chain.slice(1),
    identity,
  };
}

export function getPrimarySpriteUrl(identity: PokemonIdentity): string {
  return resolvePokemonSprite(identity).chain[0];
}
