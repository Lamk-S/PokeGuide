import type { PokemonIdentity } from "../value-objects/PokemonIdentity";
export interface SpriteResolution {
  chain: string[];
  primaryKey: string;
  fallbackKeys: string[];
  identity: PokemonIdentity;
}
const SPECIES_FALLBACK_MAP: Record<string, number> = {
  charizard: 6,
  venusaur: 3,
  gengar: 94,
  pikachu: 25,
  zygarde: 718,
  absol: 359,
  eternatus: 890,
  raichu: 26,
  cyclizar: 1005,
  aerodactyl: 142,
  luxray: 405,
  gyarados: 130,
  dragonite: 149,
  clefable: 36,
  corviknight: 823,
  rotom: 479,
  tyranitar: 248,
  ferrothorn: 598,
  dragapult: 887,
  heatran: 485,
  toxapex: 748,
  weavile: 461,
  landorus: 645,
  gholdengo: 1000,
};
const FORM_SPRITE_ID: Record<string, number> = {
  "charizard-mega-x": 10034,
  "charizard-mega-y": 10033,
  "charizard-gmax": 10129,
  "venusaur-mega": 10003,
  "gengar-mega": 10013,
  "gengar-gmax": 10130,
};
export function resolvePokemonSprite(
  identity: PokemonIdentity,
): SpriteResolution {
  const rawName =
    (identity as unknown as { name?: string }).name?.toLowerCase() ?? "";
  const baseId =
    (identity as unknown as { numericId?: number }).numericId ??
    (identity as unknown as { id?: number }).id ??
    25;
  const formIdFromName = FORM_SPRITE_ID[rawName];
  const formIdFromIdentity = (identity as unknown as { formId?: number })
    .formId;
  const primaryFormId =
    formIdFromName ??
    (formIdFromIdentity && formIdFromIdentity >= 10000
      ? formIdFromIdentity
      : undefined);
  const chain: string[] = [];
  if (primaryFormId) {
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${primaryFormId}.png`,
    );
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${primaryFormId}.png`,
    );
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${primaryFormId}.png`,
    );
  }
  chain.push(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${baseId}.png`,
  );
  chain.push(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${baseId}.png`,
  );
  chain.push(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${baseId}.png`,
  );
  const speciesId =
    (identity as unknown as { speciesId?: string }).speciesId ?? "";
  const baseFallback =
    SPECIES_FALLBACK_MAP[speciesId] ??
    SPECIES_FALLBACK_MAP[rawName.split("-")[0]];
  if (baseFallback && baseFallback !== baseId) {
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${baseFallback}.png`,
    );
    chain.push(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${baseFallback}.png`,
    );
  }
  chain.push("/placeholder-sprite.png");
  return {
    chain,
    primaryKey: `${primaryFormId ?? baseId}`,
    fallbackKeys: chain.slice(1),
    identity,
  };
}
export function getPrimarySpriteUrl(identity: PokemonIdentity): string {
  return resolvePokemonSprite(identity).chain[0];
}
