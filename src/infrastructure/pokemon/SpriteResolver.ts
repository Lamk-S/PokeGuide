const Z_TO_MEGA: Record<string, string> = {
  "absol-z": "absol-mega",
  "garchomp-z": "garchomp-mega",
  "lucario-z": "lucario-mega",
  "gengar-z": "gengar-mega",
  "kangaskhan-z": "kangaskhan-mega",
  "blastoise-z": "blastoise-mega",
  "latias-z": "latias-mega",
  "aerodactyl-z": "aerodactyl-mega",
  "charizard-z": "charizard-megay",
  "charizard-mega-z": "charizard-megay",
};

const MEGA_POKEMON = new Set([
  "venusaur",
  "charizard",
  "blastoise",
  "alakazam",
  "gengar",
  "kangaskhan",
  "pinsir",
  "gyarados",
  "aerodactyl",
  "mewtwo",
  "ampharos",
  "scizor",
  "heracross",
  "houndoom",
  "tyranitar",
  "blaziken",
  "gardevoir",
  "mawile",
  "aggron",
  "medicham",
  "manectric",
  "banette",
  "absol",
  "garchomp",
  "lucario",
  "abomasnow",
  "beedrill",
  "pidgeot",
  "slowbro",
  "steelix",
  "sableye",
  "sharpedo",
  "camerupt",
  "altaria",
  "glalie",
  "salamence",
  "metagross",
  "latias",
  "latios",
  "lopunny",
  "gallade",
  "audino",
  "diancie",
]);

const MEGA_ARTWORK_ID: Record<string, number> = {
  "absol-mega": 10062,
  "garchomp-mega": 10058,
  "lucario-mega": 10059,
  "gengar-mega": 10038,
  "kangaskhan-mega": 10039,
  "blastoise-mega": 10036,
  "charizard-megax": 10034,
  "charizard-megay": 10035,
};

export const SpriteResolver = {
  normalize(name: string): string {
    let n = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/['.:]/g, "");

    if (Z_TO_MEGA[n]) return Z_TO_MEGA[n];

    if (n.endsWith("-z")) {
      const base = n.replace(/-z$/, "");
      if (MEGA_POKEMON.has(base) || base.includes("-mega")) {
        n = base.includes("mega") ? base : `${base}-mega`;
      }
    }
    n = n.replace("-mega-z", "-mega").replace("-z-mega", "-mega");

    n = n.replace("-mega-x", "-megax").replace("-mega-y", "-megay");
    if (n === "greninja-battle-bond") return "greninja-ash";
    if (n === "zygarde-50-power-construct") return "zygarde";
    if (n === "zygarde-10-power-construct") return "zygarde-10";
    if (n === "zygarde-50") return "zygarde";
    if (n === "aegislash-shield") return "aegislash";
    if (n === "pumpkaboo-average") return "pumpkaboo";
    if (n === "gourgeist-average") return "gourgeist";

    const strip = [
      "-totem",
      "-partner",
      "-starter",
      "-world",
      "-busted",
      "-disguised",
    ];
    for (const s of strip) if (n.endsWith(s)) n = n.replace(s, "");

    return n;
  },

  getSpriteChain(pokemon: { id: number; name: string }, hd = false): string[] {
    const specific = this.normalize(pokemon.name);
    const base = pokemon.name.split("-")[0].toLowerCase();
    const isMega =
      specific.includes("mega") ||
      specific.includes("megax") ||
      specific.includes("megay");
    const isGmax = specific.endsWith("gmax");

    const artworkId = MEGA_ARTWORK_ID[specific];
    const officialArtwork = artworkId
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${artworkId}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    const ani = `https://play.pokemonshowdown.com/sprites/ani/${specific}.gif`;
    const dexHd = `https://play.pokemonshowdown.com/sprites/dex/${specific}.png`;
    const gen8 = `https://play.pokemonshowdown.com/sprites/gen8/${specific}.png`;

    if (isMega || isGmax) {
      return [
        ...(hd ? [dexHd, ani] : [ani, dexHd]),
        gen8,
        `https://play.pokemonshowdown.com/sprites/gen5/${specific}.png`,
        officialArtwork,
        "/placeholder-sprite.png",
      ];
    }

    return [
      ...(hd ? [dexHd, ani] : [ani]),
      base !== specific
        ? `https://play.pokemonshowdown.com/sprites/ani/${base}.gif`
        : "",
      dexHd,
      gen8,
      `https://play.pokemonshowdown.com/sprites/gen5/${specific}.png`,
      officialArtwork,
      "/placeholder-sprite.png",
    ].filter(Boolean) as string[];
  },
} as const;
