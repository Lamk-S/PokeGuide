/**
 * Traduce PokeAPI -> @smogon/calc
 * Soporta Mega, GMAX, regionales y casos especiales como Zygarde y Greninja Ash
 */
export const SmogonSpeciesMapper = {
  map(pokeApiName: string, generation = 9): string {
    const lower = pokeApiName.toLowerCase();

    const exact: Record<string, string> = {
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
      "zygarde-10-power-construct-complete": "Zygarde-Complete",

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

    if (exact[lower]) return exact[lower];

    if (
      generation < 8 &&
      (lower.endsWith("-gmax") || lower.endsWith("-gigantamax"))
    ) {
      const base = lower.replace(/-gmax|-gigantamax/g, "");
      return SmogonSpeciesMapper.map(base, generation);
    }

    const cosmetic = [
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
    for (const suf of cosmetic) {
      if (lower.endsWith(suf)) {
        const base = lower.replace(suf, "");
        return SmogonSpeciesMapper.map(base, generation);
      }
    }

    const parts = lower.split("-");
    const smogon = parts
      .map((p) => {
        if (p === "mega") return "Mega";
        if (p === "gmax" || p === "gigantamax") return "Gmax";
        if (p === "x" || p === "y") return p.toUpperCase();
        if (p === "alola" || p === "galar" || p === "hisui" || p === "paldea") {
          return p.charAt(0).toUpperCase() + p.slice(1);
        }
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
      .join("-");

    return smogon;
  },
} as const;
