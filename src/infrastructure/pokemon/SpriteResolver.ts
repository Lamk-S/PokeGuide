// biome-ignore lint/complexity/noStaticOnlyClass: Id-first resolver, usado como namespace estático en tests y legacy
export class SpriteResolver {
  static getSpriteChain(
    pokemon: { id: number; name: string },
    _shiny = false,
  ): string[] {
    const id = pokemon.id;
    const chain: string[] = [
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    ];
    const baseId = SpriteResolver.getBaseIdForFallback(pokemon.name);
    if (baseId && baseId !== id) {
      chain.push(
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${baseId}.png`,
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${baseId}.png`,
      );
    }
    chain.push("/placeholder-sprite.png");
    return chain;
  }
  static getPrimarySprite(pokemon: { id: number; name: string }): string {
    return SpriteResolver.getSpriteChain(pokemon, false)[0];
  }
  private static getBaseIdForFallback(name: string): number | null {
    const map: Record<string, number> = {
      zygarde: 718,
      absol: 359,
      charizard: 6,
      garchomp: 445,
      pikachu: 25,
      eternatus: 890,
      raichu: 26,
      cyclizar: 1005,
      giratina: 487,
    };
    const lower = name.toLowerCase();
    const root = lower.split("-")[0];
    return map[root] ?? map[lower] ?? null;
  }
}
