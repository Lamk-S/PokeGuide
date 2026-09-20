import type { PokemonId, PokemonName } from "@/domain/pokemon/types/pokemon";

export interface SmogonResolution {
  smogonName: string;
  supported: boolean;
  reason?: string;
  isFallbackToBase: boolean;
}

type PokemonRef = {
  id: PokemonId;
  name: PokemonName;
};

const SMOGON_ID_OVERRIDES: Record<
  PokemonId,
  { smogonName: string; supported: boolean; reason?: string }
> = {
  10307: {
    smogonName: "Absol-Mega",
    supported: false,
    reason: "Forma absol-mega-z no canónica, no soportada por Showdown",
  },
  10308: {
    smogonName: "Staraptor-Mega",
    supported: false,
    reason: "Forma staraptor-mega no oficial",
  },
  10309: {
    smogonName: "Garchomp-Mega",
    supported: false,
    reason: "Forma garchomp-mega-z no canónica",
  },
  10310: {
    smogonName: "Lucario-Mega",
    supported: false,
    reason: "Forma lucario-mega-z no canónica",
  },
  10311: {
    smogonName: "Heatran-Mega",
    supported: false,
    reason: "Forma heatran-mega no oficial",
  },
};

const EXACT_NAME_OVERRIDES: Record<string, string> = {
  "mr-mime": "Mr. Mime",
  "mr-rime": "Mr. Rime",
  "mime-jr": "Mime Jr.",
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  "type-null": "Type: Null",
  "nidoran-f": "Nidoran-F",
  "nidoran-m": "Nidoran-M",
  flabebe: "Flabebe",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "giratina-altered": "Giratina",
  "giratina-origin": "Giratina-Origin",
  "deoxys-normal": "Deoxys",
  "deoxys-attack": "Deoxys-Attack",
  "deoxys-defense": "Deoxys-Defense",
  "deoxys-speed": "Deoxys-Speed",
  "wormadam-plant": "Wormadam",
  "wormadam-sandy": "Wormadam-Sandy",
  "wormadam-trash": "Wormadam-Trash",
  rotom: "Rotom",
  "rotom-heat": "Rotom-Heat",
  "rotom-wash": "Rotom-Wash",
  "rotom-frost": "Rotom-Frost",
  "rotom-fan": "Rotom-Fan",
  "rotom-mow": "Rotom-Mow",
  "shaymin-land": "Shaymin",
  "shaymin-sky": "Shaymin-Sky",
  "basculin-red-striped": "Basculin",
  "basculin-blue-striped": "Basculin-Blue-Striped",
  "basculin-white-striped": "Basculin-White-Striped",
  "basculegion-male": "Basculegion",
  "basculegion-female": "Basculegion-F",
  "darmanitan-standard": "Darmanitan",
  "darmanitan-zen": "Darmanitan-Zen",
  "darmanitan-galar-standard": "Darmanitan-Galar",
  "darmanitan-galar-zen": "Darmanitan-Galar-Zen",
  "tornadus-incarnate": "Tornadus",
  "tornadus-therian": "Tornadus-Therian",
  "thundurus-incarnate": "Thundurus",
  "thundurus-therian": "Thundurus-Therian",
  "landorus-incarnate": "Landorus",
  "landorus-therian": "Landorus-Therian",
  "enamorus-incarnate": "Enamorus",
  "enamorus-therian": "Enamorus-Therian",
  "keldeo-ordinary": "Keldeo",
  "keldeo-resolute": "Keldeo-Resolute",
  "meloetta-aria": "Meloetta",
  "meloetta-pirouette": "Meloetta-Pirouette",
  genesect: "Genesect",
  "genesect-burn": "Genesect-Burn",
  "genesect-chill": "Genesect-Chill",
  "genesect-douse": "Genesect-Douse",
  "genesect-shock": "Genesect-Shock",
  "aegislash-shield": "Aegislash",
  "aegislash-blade": "Aegislash-Blade",
  "pumpkaboo-average": "Pumpkaboo",
  "pumpkaboo-small": "Pumpkaboo-Small",
  "pumpkaboo-large": "Pumpkaboo-Large",
  "pumpkaboo-super": "Pumpkaboo-Super",
  "gourgeist-average": "Gourgeist",
  "gourgeist-small": "Gourgeist-Small",
  "gourgeist-large": "Gourgeist-Large",
  "gourgeist-super": "Gourgeist-Super",
  "zygarde-50": "Zygarde",
  "zygarde-10": "Zygarde-10",
  "zygarde-complete": "Zygarde-Complete",
  "zygarde-10-power-construct": "Zygarde-10",
  "zygarde-50-power-construct": "Zygarde",
  hoopa: "Hoopa",
  "hoopa-unbound": "Hoopa-Unbound",
  "oricorio-baile": "Oricorio",
  "oricorio-pom-pom": "Oricorio-Pom-Pom",
  "oricorio-pau": "Oricorio-Pa'u",
  "oricorio-sensu": "Oricorio-Sensu",
  "lycanroc-midday": "Lycanroc",
  "lycanroc-midnight": "Lycanroc-Midnight",
  "lycanroc-dusk": "Lycanroc-Dusk",
  "wishiwashi-solo": "Wishiwashi",
  "wishiwashi-school": "Wishiwashi-School",
  "minior-red-meteor": "Minior",
  "minior-red": "Minior-Meteor",
  "mimikyu-disguised": "Mimikyu",
  "mimikyu-busted": "Mimikyu-Busted",
  "greninja-ash": "Greninja-Ash",
  "greninja-battle-bond": "Greninja-Ash",
  "toxtricity-amped": "Toxtricity",
  "toxtricity-low-key": "Toxtricity-Low-Key",
  "eiscue-ice": "Eiscue",
  "eiscue-noice": "Eiscue-Noice",
  "indeedee-male": "Indeedee",
  "indeedee-female": "Indeedee-F",
  "morpeko-full-belly": "Morpeko",
  "morpeko-hangry": "Morpeko-Hangry",
  "urshifu-single-strike": "Urshifu",
  "urshifu-rapid-strike": "Urshifu-Rapid-Strike",
  "calyrex-ice": "Calyrex-Ice",
  "calyrex-shadow": "Calyrex-Shadow",
  "zarude-dada": "Zarude-Dada",
  "maushold-family-of-four": "Maushold",
  "maushold-family-of-three": "Maushold-Three",
  "squawkabilly-green-plumage": "Squawkabilly",
  "squawkabilly-blue-plumage": "Squawkabilly-Blue",
  "squawkabilly-yellow-plumage": "Squawkabilly-Yellow",
  "squawkabilly-white-plumage": "Squawkabilly-White",
  "palafin-zero": "Palafin",
  "palafin-hero": "Palafin-Hero",
  "tatsugiri-curly": "Tatsugiri",
  "dudunsparce-two-segment": "Dudunsparce",
  "dudunsparce-three-segment": "Dudunsparce-Three-Segment",
  "gimmighoul-chest": "Gimmighoul",
  "gimmighoul-roaming": "Gimmighoul-Roaming",
  "ogerpon-teal-mask": "Ogerpon",
  "ogerpon-wellspring-mask": "Ogerpon-Wellspring",
  "ogerpon-hearthflame-mask": "Ogerpon-Hearthflame",
  "ogerpon-cornerstone-mask": "Ogerpon-Cornerstone",
  "terapagos-normal": "Terapagos",
  "terapagos-terastal": "Terapagos-Terastal",
  "terapagos-stellar": "Terapagos-Stellar",
  "castform-normal": "Castform",
};

const COSMETIC_SUFFIXES = [
  "-totem",
  "-cap",
  "-original-cap",
  "-hoenn-cap",
  "-sinnoh-cap",
  "-unova-cap",
  "-kalos-cap",
  "-alola-cap",
  "-partner",
  "-starter",
  "-world",
];

function isGmaxForm(lower: string): boolean {
  return lower.endsWith("-gmax") || lower.endsWith("-gigantamax");
}

function stripGmax(lower: string): string {
  return lower.replace(/-gmax|-gigantamax/g, "");
}

function isCosmetic(lower: string): string | undefined {
  return COSMETIC_SUFFIXES.find((s) => lower.endsWith(s));
}

function capitalizeSegment(seg: string): string {
  if (seg === "mega") return "Mega";
  if (seg === "gmax" || seg === "gigantamax") return "Gmax";
  if (seg === "x" || seg === "y") return seg.toUpperCase();
  if (
    seg === "alola" ||
    seg === "galar" ||
    seg === "hisui" ||
    seg === "paldea"
  ) {
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

function genericSmogonFromSlug(lower: string): string {
  return lower.split("-").map(capitalizeSegment).join("-");
}

function checkGenerationSupport(
  smogonName: string,
  lower: string,
  generation: number,
): { supported: boolean; reason?: string } {
  if (smogonName.includes("Gmax") && generation < 8) {
    return { supported: false, reason: `Gmax no existe en Gen ${generation}` };
  }
  if (lower.includes("-paldea") && generation < 9) {
    return { supported: false, reason: "Forma Paldea solo desde Gen 9" };
  }
  if (lower.includes("-hisui") && generation < 8) {
    return { supported: false, reason: "Forma Hisui solo desde Gen 8" };
  }
  if (lower.includes("-galar") && generation < 8) {
    return { supported: false, reason: "Forma Galar solo desde Gen 8" };
  }
  if (
    (lower.includes("ogerpon") ||
      lower.includes("terapagos") ||
      lower.includes("palafin-hero")) &&
    generation < 9
  ) {
    return {
      supported: false,
      reason: `${smogonName} solo disponible en Gen 9`,
    };
  }
  return { supported: true };
}

function buildResolution(
  smogonName: string,
  supported: boolean,
  isFallbackToBase: boolean,
  reason?: string,
): SmogonResolution {
  if (reason) {
    return { smogonName, supported, reason, isFallbackToBase };
  }
  return { smogonName, supported, isFallbackToBase };
}

export const SmogonSpeciesMapper = {
  resolve(ref: PokemonRef, generation: number): SmogonResolution {
    const lower = ref.name.toLowerCase().trim();

    const idOverride = SMOGON_ID_OVERRIDES[ref.id];
    if (idOverride) {
      return buildResolution(
        idOverride.smogonName,
        idOverride.supported,
        false,
        idOverride.reason,
      );
    }

    if (isGmaxForm(lower) && generation < 8) {
      const baseSlug = stripGmax(lower);
      const baseRef: PokemonRef = { id: ref.id, name: baseSlug };
      const baseResolution = SmogonSpeciesMapper.resolve(baseRef, generation);
      return buildResolution(
        baseResolution.smogonName,
        baseResolution.supported,
        true,
        baseResolution.reason,
      );
    }

    const exact = EXACT_NAME_OVERRIDES[lower];
    if (exact) {
      const support = checkGenerationSupport(exact, lower, generation);
      return buildResolution(exact, support.supported, false, support.reason);
    }

    const cosmetic = isCosmetic(lower);
    if (cosmetic) {
      const baseSlug = lower.slice(0, -cosmetic.length);
      const baseRef: PokemonRef = { id: ref.id, name: baseSlug };
      return SmogonSpeciesMapper.resolve(baseRef, generation);
    }

    if (lower.endsWith("-mega-z") || lower.endsWith("-z-mega")) {
      const cleaned = lower.replace(/-z|-mega-z|-z-mega/g, "");
      return buildResolution(
        `${genericSmogonFromSlug(cleaned)}-Mega`,
        false,
        false,
        `Forma ${ref.name} no canónica`,
      );
    }

    const generic = genericSmogonFromSlug(lower);
    const support = checkGenerationSupport(generic, lower, generation);
    return buildResolution(generic, support.supported, false, support.reason);
  },

  map(pokeApiName: string, generation = 9): string {
    const ref: PokemonRef = { id: 0, name: pokeApiName };
    const res = SmogonSpeciesMapper.resolve(ref, generation);
    return res.smogonName;
  },

  mapById(
    id: PokemonId,
    name: PokemonName,
    generation: number,
  ): SmogonResolution {
    return SmogonSpeciesMapper.resolve({ id, name }, generation);
  },
} as const;
