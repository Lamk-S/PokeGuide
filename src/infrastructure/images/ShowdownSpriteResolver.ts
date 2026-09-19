import { SpriteResolver } from "@/infrastructure/pokemon/SpriteResolver";

export const ShowdownSpriteResolver = {
  normalize: (n: string) => SpriteResolver.normalize(n),
  getUrl: (name: string, gen = 9) => {
    const base = SpriteResolver.normalize(name);
    if (gen <= 5)
      return `https://play.pokemonshowdown.com/sprites/gen${gen}/${base}.png`;
    return `https://play.pokemonshowdown.com/sprites/ani/${base}.gif`;
  },
  getFallbackChain: (name: string, id?: number) =>
    SpriteResolver.getSpriteChain({ id: id ?? 0, name }),
} as const;
