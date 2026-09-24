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

function normalizeSmogonName(name: string): string {
  const lower = name.toLowerCase();
  if (SMOGON_NAME_MAP[lower]) return SMOGON_NAME_MAP[lower];
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
    const originalName = pokemon.name.toLowerCase();
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
        smogonName: normalizeSmogonName(originalName),
        supported: false,
        reason: `La forma ${originalName} debutó en Gen ${debutGen}, no está disponible en Gen ${generation}`,
      };
    }

    if (originalName.includes("mega") && generation < 6) {
      return {
        smogonName: normalizeSmogonName(originalName),
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
        smogonName: normalizeSmogonName(originalName),
        supported: false,
        isFallbackToBase: true,
        baseStatsSource: normalizeSmogonName(baseFallback),
        reason: `Gigantamax no disponible en Gen ${generation} (disponible desde Gen 8) - fallback a ${baseFallback}`,
      };
    }

    let smogonName = normalizeSmogonName(originalName);

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
}
