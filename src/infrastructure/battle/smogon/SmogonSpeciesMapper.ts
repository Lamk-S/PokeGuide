export interface SmogonResolution {
  smogonName: string;
  supported: boolean;
  reason?: string | undefined;
  baseStatsSource?: string | undefined;
  useBaseForGen9?: boolean | undefined;
  isFallbackToBase?: boolean | undefined;
  isCustom?: boolean | undefined;
}

const DEBUT_GENERATION: Record<string, number> = {
  bulbasaur: 1,
  charizard: 1,
  pikachu: 1,
  raichu: 1,
  absol: 3,
  staraptor: 4,
  garchomp: 4,
  lucario: 4,
  heatran: 4,
  darkrai: 4,
  zygarde: 6,
  cyclizar: 9,
  palafin: 9,
  garchompbase: 4,
  urshifu: 8,
  "urshifu-single-strike": 8,
  "urshifu-rapid-strike": 8,
  eternatus: 8,
  giratina: 4,
  "giratina-altered": 4,
  "giratina-origin": 4,
};

const SMOGON_NAME_MAP: Record<string, string> = {
  "palafin-zero": "Palafin",
  "palafin-hero": "Palafin-Hero",
  "palafin-zero-base": "Palafin",
  "palafin-base": "Palafin",
  "absol-mega-z": "Absol-Mega",
  "absol-mega": "Absol-Mega",
  "absol-mega-y": "Absol-Mega",
  "garchomp-mega-z": "Garchomp-Mega",
  "garchomp-mega": "Garchomp-Mega",
  "lucario-mega-z": "Lucario-Mega",
  "lucario-mega": "Lucario-Mega",
  "zygarde-mega": "Zygarde",
  "zygarde-10": "Zygarde-10%",
  "zygarde-50": "Zygarde",
  "zygarde-complete": "Zygarde-Complete",
  "zygarde-50-power-construct": "Zygarde",
  "charizard-gmax": "Charizard-Gmax",
  "charizard-gigantamax": "Charizard-Gmax",
  "pikachu-gmax": "Pikachu-Gmax",
  "pikachu-gigantamax": "Pikachu-Gmax",
  "urshifu-single-strike-gmax": "Urshifu-Gmax",
  "urshifu-single-strike-gigantamax": "Urshifu-Gmax",
  "urshifu-rapid-strike-gmax": "Urshifu-Rapid-Strike-Gmax",
  "urshifu-rapid-strike-gigantamax": "Urshifu-Rapid-Strike-Gmax",
  "staraptor-mega": "Staraptor",
  "heatran-mega": "Heatran",
  "darkrai-mega": "Darkrai",
  cyclizar: "Cyclizar",
  garchompbase: "Garchomp",
  "giratina-altered": "Giratina",
  "giratina-origin": "Giratina-Origin",
  "pikachu-rock-star": "Pikachu",
};

const GEN9_MEGA_FALLBACK: Record<string, string> = {
  "Absol-Mega": "Absol",
  "Garchomp-Mega": "Garchomp",
  "Lucario-Mega": "Lucario",
  "Charizard-Gmax": "Charizard",
  "Pikachu-Gmax": "Pikachu",
  "Urshifu-Gmax": "Urshifu",
  "Urshifu-Rapid-Strike-Gmax": "Urshifu-Rapid-Strike",
};

const ID_TO_SMOGON: Record<number, string> = {
  1: "Bulbasaur",
  2: "Ivysaur",
  3: "Venusaur",
  4: "Charmander",
  5: "Charmeleon",
  6: "Charizard",
  7: "Squirtle",
  8: "Wartortle",
  9: "Blastoise",
  10: "Caterpie",
  11: "Metapod",
  12: "Butterfree",
  13: "Weedle",
  14: "Kakuna",
  15: "Beedrill",
  16: "Pidgey",
  17: "Pidgeotto",
  18: "Pidgeot",
  19: "Rattata",
  20: "Raticate",
  21: "Spearow",
  22: "Fearow",
  23: "Ekans",
  24: "Arbok",
  25: "Pikachu",
  26: "Raichu",
  27: "Sandshrew",
  28: "Sandslash",
  29: "Nidoran-F",
  30: "Nidorina",
  31: "Nidoqueen",
  32: "Nidoran-M",
  33: "Nidorino",
  34: "Nidoking",
  35: "Clefairy",
  36: "Clefable",
  37: "Vulpix",
  38: "Ninetales",
  39: "Jigglypuff",
  40: "Wigglytuff",
  41: "Zubat",
  42: "Golbat",
  43: "Oddish",
  44: "Gloom",
  45: "Vileplume",
  46: "Paras",
  47: "Parasect",
  48: "Venonat",
  49: "Venomoth",
  50: "Diglett",
  51: "Dugtrio",
  52: "Meowth",
  53: "Persian",
  54: "Psyduck",
  55: "Golduck",
  56: "Mankey",
  57: "Primeape",
  58: "Growlithe",
  59: "Arcanine",
  60: "Poliwag",
  61: "Poliwhirl",
  62: "Poliwrath",
  63: "Abra",
  64: "Kadabra",
  65: "Alakazam",
  66: "Machop",
  67: "Machoke",
  68: "Machamp",
  69: "Bellsprout",
  70: "Weepinbell",
  71: "Victreebel",
  72: "Tentacool",
  73: "Tentacruel",
  74: "Geodude",
  75: "Graveler",
  76: "Golem",
  77: "Ponyta",
  78: "Rapidash",
  79: "Slowpoke",
  80: "Slowbro",
  81: "Magnemite",
  82: "Magneton",
  83: "Farfetch'd",
  84: "Doduo",
  85: "Dodrio",
  86: "Seel",
  87: "Dewgong",
  88: "Grimer",
  89: "Muk",
  90: "Shellder",
  91: "Cloyster",
  92: "Gastly",
  93: "Haunter",
  94: "Gengar",
  95: "Onix",
  96: "Drowzee",
  97: "Hypno",
  98: "Krabby",
  99: "Kingler",
  100: "Voltorb",
  101: "Electrode",
  102: "Exeggcute",
  103: "Exeggutor",
  104: "Cubone",
  105: "Marowak",
  106: "Hitmonlee",
  107: "Hitmonchan",
  108: "Lickitung",
  109: "Koffing",
  110: "Weezing",
  111: "Rhyhorn",
  112: "Rhydon",
  113: "Chansey",
  114: "Tangela",
  115: "Kangaskhan",
  116: "Horsea",
  117: "Seadra",
  118: "Goldeen",
  119: "Seaking",
  120: "Staryu",
  121: "Starmie",
  122: "Mr. Mime",
  123: "Scyther",
  124: "Jynx",
  125: "Electabuzz",
  126: "Magmar",
  127: "Pinsir",
  128: "Tauros",
  129: "Magikarp",
  130: "Gyarados",
  131: "Lapras",
  132: "Ditto",
  133: "Eevee",
  134: "Vaporeon",
  135: "Jolteon",
  136: "Flareon",
  137: "Porygon",
  138: "Omanyte",
  139: "Omastar",
  140: "Kabuto",
  141: "Kabutops",
  142: "Aerodactyl",
  143: "Snorlax",
  144: "Articuno",
  145: "Zapdos",
  146: "Moltres",
  147: "Dratini",
  148: "Dragonair",
  149: "Dragonite",
  150: "Mewtwo",
  151: "Mew",
  359: "Absol",
  445: "Garchomp",
  448: "Lucario",
  10307: "Absol",
  10308: "Staraptor",
  10309: "Garchomp",
  10310: "Lucario",
};

function normalizeSmogonName(name: string): string {
  const lower = name.toLowerCase();
  if (SMOGON_NAME_MAP[lower]) return SMOGON_NAME_MAP[lower];
  const pokemonMatch = lower.match(/^pokemon-(\d+)$/);
  if (pokemonMatch) {
    const id = parseInt(pokemonMatch[1], 10);
    if (ID_TO_SMOGON[id]) return ID_TO_SMOGON[id];
  }
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");
}

function getDebutGen(speciesId: string, originalName: string): number {
  const lower = originalName.toLowerCase();
  if (DEBUT_GENERATION[lower] !== undefined) return DEBUT_GENERATION[lower];
  if (DEBUT_GENERATION[speciesId] !== undefined)
    return DEBUT_GENERATION[speciesId];
  const base = speciesId.toLowerCase();
  if (DEBUT_GENERATION[base] !== undefined) return DEBUT_GENERATION[base];
  return 1;
}

// biome-ignore lint/complexity/noStaticOnlyClass: wrapper for backward compat
export class SmogonSpeciesMapper {
  static resolve(
    pokemon: { id: number; name: string },
    generation: number,
  ): SmogonResolution {
    let rawName = pokemon.name;

    if (
      !rawName ||
      rawName.trim() === "" ||
      /^pokemon-\d+$/i.test(rawName) ||
      /^\d+$/.test(rawName)
    ) {
      const fromId = ID_TO_SMOGON[pokemon.id];
      if (fromId) {
        rawName = fromId;
      } else {
        const match = pokemon.name.match(/^pokemon-(\d+)$/i);
        if (match) {
          const idFromName = parseInt(match[1], 10);
          const fromIdFromName = ID_TO_SMOGON[idFromName];
          if (fromIdFromName) rawName = fromIdFromName;
        }
      }
    }

    if (!rawName || /^pokemon-\d+$/i.test(rawName)) {
      const fallback = ID_TO_SMOGON[pokemon.id] || "Bulbasaur";
      return {
        smogonName: fallback,
        supported: false,
        isFallbackToBase: true,
        reason: `Nombre inválido "${pokemon.name}" para ID ${pokemon.id}, fallback a ${fallback}`,
      };
    }

    const originalName = rawName.toLowerCase();
    let baseSpecies = originalName
      .replace(/-mega-z|-z-mega|-mega|-gmax|-gigantamax/g, "")
      .replace(/-power-construct|-complete|-10|-50/g, "")
      .replace(/-zero|-hero|-base/g, "")
      .replace(/-single-strike.*|-rapid-strike.*/g, "")
      .split("-")[0];

    if (originalName.includes("palafin")) baseSpecies = "palafin";
    if (originalName.includes("garchomp")) baseSpecies = "garchomp";
    if (originalName.includes("urshifu"))
      baseSpecies = originalName.includes("rapid")
        ? "urshifu-rapid-strike"
        : "urshifu-single-strike";
    if (originalName.includes("absol")) baseSpecies = "absol";
    if (originalName.includes("lucario")) baseSpecies = "lucario";
    if (originalName.includes("zygarde")) baseSpecies = "zygarde-50";
    if (originalName.includes("cyclizar")) baseSpecies = "cyclizar";
    if (originalName.includes("charizard")) baseSpecies = "charizard";
    if (originalName.includes("pikachu")) baseSpecies = "pikachu";

    const debutGen = getDebutGen(baseSpecies, originalName);

    if (generation < debutGen) {
      return {
        smogonName: normalizeSmogonName(rawName),
        supported: false,
        reason: `La forma ${originalName} debutó en Gen ${debutGen}, no está disponible en Gen ${generation}`,
      };
    }

    if (originalName.includes("mega") && generation < 6) {
      return {
        smogonName: normalizeSmogonName(rawName),
        supported: false,
        reason: `Mega evolución no disponible en Gen ${generation} (disponible desde Gen 6)`,
      };
    }

    if (
      (originalName.includes("gmax") || originalName.includes("gigantamax")) &&
      generation < 8
    ) {
      const baseFallback = originalName.replace(/-gmax|-gigantamax/g, "");
      return {
        smogonName: normalizeSmogonName(rawName),
        supported: false,
        isFallbackToBase: true,
        baseStatsSource: normalizeSmogonName(baseFallback),
        reason: `Gigantamax no disponible en Gen ${generation} (disponible desde Gen 8) - fallback a ${baseFallback}`,
      };
    }

    let smogonName = normalizeSmogonName(rawName);

    const isCustom = pokemon.id >= 10000;
    if (
      generation === 9 &&
      isCustom &&
      (originalName.includes("mega") ||
        originalName.includes("gmax") ||
        originalName.includes("gigantamax") ||
        originalName.includes("mega-z"))
    ) {
      const fallback = GEN9_MEGA_FALLBACK[smogonName] || baseSpecies;
      const resolvedFallback = normalizeSmogonName(fallback);
      return {
        smogonName,
        supported: false,
        isFallbackToBase: true,
        useBaseForGen9: true,
        isCustom: true,
        baseStatsSource: resolvedFallback,
        reason: `Forma custom ${originalName} no oficial en Gen 9, fallback a ${fallback}`,
      };
    }

    if (generation === 9) {
      if (GEN9_MEGA_FALLBACK[smogonName]) {
        return {
          smogonName,
          supported: true,
          useBaseForGen9: true,
          isFallbackToBase: true,
          baseStatsSource: GEN9_MEGA_FALLBACK[smogonName],
        };
      }
    }

    if (
      originalName.includes("palafin-zero") ||
      originalName.includes("palafin-zero-base")
    ) {
      smogonName = "Palafin";
    }

    if (baseSpecies === "garchomp" && !originalName.includes("mega")) {
      smogonName = "Garchomp";
    }

    return {
      smogonName,
      supported: true,
    };
  }

  static getFallbackForGen9(smogonName: string): string | null {
    return GEN9_MEGA_FALLBACK[smogonName] || null;
  }

  static getSmogonNameById(id: number): string | undefined {
    return ID_TO_SMOGON[id];
  }
}
