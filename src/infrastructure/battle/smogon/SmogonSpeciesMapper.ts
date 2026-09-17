/**
 * Traduce identificadores de PokeAPI a los nombres canónicos de @smogon/calc.
 * Previene: Cannot read properties of undefined (reading 'hp')
 */
export const SmogonSpeciesMapper = {
  map(pokeApiName: string): string {
    const exact: Record<string, string> = {
      // --- Casos especiales con símbolos ---
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

      // --- Giratina y base ---
      "giratina-altered": "Giratina",
      "giratina-origin": "Giratina-Origin",

      // --- Deoxys ---
      "deoxys-normal": "Deoxys",
      "deoxys-attack": "Deoxys-Attack",
      "deoxys-defense": "Deoxys-Defense",
      "deoxys-speed": "Deoxys-Speed",

      // --- Wormadam / Rotom ---
      "wormadam-plant": "Wormadam",
      "wormadam-sandy": "Wormadam-Sandy",
      "wormadam-trash": "Wormadam-Trash",
      rotom: "Rotom",
      "rotom-heat": "Rotom-Heat",
      "rotom-wash": "Rotom-Wash",
      "rotom-frost": "Rotom-Frost",
      "rotom-fan": "Rotom-Fan",
      "rotom-mow": "Rotom-Mow",

      // --- Shaymin ---
      "shaymin-land": "Shaymin",
      "shaymin-sky": "Shaymin-Sky",

      // --- Basculin / Basculegion ---
      "basculin-red-striped": "Basculin",
      "basculin-blue-striped": "Basculin-Blue-Striped",
      "basculin-white-striped": "Basculin-White-Striped",
      "basculegion-male": "Basculegion",
      "basculegion-female": "Basculegion-F",

      // --- Darmanitan ---
      "darmanitan-standard": "Darmanitan",
      "darmanitan-zen": "Darmanitan-Zen",
      "darmanitan-galar-standard": "Darmanitan-Galar",
      "darmanitan-galar-zen": "Darmanitan-Galar-Zen",

      // --- Genios ---
      "tornadus-incarnate": "Tornadus",
      "tornadus-therian": "Tornadus-Therian",
      "thundurus-incarnate": "Thundurus",
      "thundurus-therian": "Thundurus-Therian",
      "landorus-incarnate": "Landorus",
      "landorus-therian": "Landorus-Therian",
      "enamorus-incarnate": "Enamorus",
      "enamorus-therian": "Enamorus-Therian",

      // --- Kyurem / Keldeo / Meloetta / Genesect ---
      "keldeo-ordinary": "Keldeo",
      "keldeo-resolute": "Keldeo-Resolute",
      "meloetta-aria": "Meloetta",
      "meloetta-pirouette": "Meloetta-Pirouette",
      genesect: "Genesect",
      "genesect-burn": "Genesect-Burn",
      "genesect-chill": "Genesect-Chill",
      "genesect-douse": "Genesect-Douse",
      "genesect-shock": "Genesect-Shock",

      // --- Aegislash / Pumpkaboo / Gourgeist ---
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

      // --- Zygarde / Hoopa / Oricorio ---
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

      // --- Lycanroc / Wishiwashi / Minior / Mimikyu ---
      "lycanroc-midday": "Lycanroc",
      "lycanroc-midnight": "Lycanroc-Midnight",
      "lycanroc-dusk": "Lycanroc-Dusk",
      "wishiwashi-solo": "Wishiwashi",
      "wishiwashi-school": "Wishiwashi-School",
      "minior-red-meteor": "Minior",
      "minior-red": "Minior-Meteor",
      "mimikyu-disguised": "Mimikyu",
      "mimikyu-busted": "Mimikyu-Busted",
      "mimikyu-totem-disguised": "Mimikyu-Totem",
      "mimikyu-totem-busted": "Mimikyu-Totem-Busted",

      // --- Otros con formas ---
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
      "urshifu-single-strike-gmax": "Urshifu",
      "urshifu-rapid-strike-gmax": "Urshifu-Rapid-Strike",
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
      aegislash: "Aegislash",
    };

    const lower = pokeApiName.toLowerCase();

    // 1. Match exacto
    if (exact[lower]) return exact[lower];

    // 2. Formas cosméticas que Smogon no tiene -> mapear a base
    // Pikachu caps, totems, gmax, gigantamax, starter, etc.
    const cosmeticSuffixes = [
      "-gmax",
      "-gigantamax",
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
      "-busted-totem",
      "-disguised",
    ];
    for (const suf of cosmeticSuffixes) {
      if (lower.endsWith(suf)) {
        const base = lower.replace(suf, "");
        if (exact[base]) return exact[base];
        return SmogonSpeciesMapper.map(base);
      }
    }

    // 3. Si es Alola/Galar/Hisui/Paldea, dejar sufijo pero capitalizado
    // meowth-alola -> Meowth-Alola
    if (
      lower.includes("-alola") ||
      lower.includes("-galar") ||
      lower.includes("-hisui") ||
      lower.includes("-paldea") ||
      lower.includes("-mega") ||
      lower.includes("-primal") ||
      lower.includes("-origin") ||
      lower.includes("-sky") ||
      lower.includes("-therian") ||
      lower.includes("-black") ||
      lower.includes("-white") ||
      lower.includes("-crowned")
    ) {
      return lower
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("-");
    }

    // 4. Fallback genérico
    return pokeApiName
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("-");
  },
} as const;
