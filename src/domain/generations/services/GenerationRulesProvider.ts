import { GenerationRuleset } from "../entities/GenerationRuleset";
import type {
  BreedingRulesConfig,
  MechanicStatus,
} from "../types/GenerationTypes";

const GEN_3_BREEDING: BreedingRulesConfig = {
  maxInheritedIVs: 3,
  everstoneChance: 0.5,
  hasDestinyKnot: false,
  inheritableTraits: [
    "nature",
    "iv_hp",
    "iv_attack",
    "iv_defense",
    "iv_specialAttack",
    "iv_specialDefense",
    "iv_speed",
  ],
};
const GEN_6_BREEDING: BreedingRulesConfig = {
  maxInheritedIVs: 5,
  everstoneChance: 1.0,
  hasDestinyKnot: true,
  inheritableTraits: [
    "nature",
    "iv_hp",
    "iv_attack",
    "iv_defense",
    "iv_specialAttack",
    "iv_specialDefense",
    "iv_speed",
    "eggMove",
  ],
};
const GEN_9_BREEDING: BreedingRulesConfig = {
  maxInheritedIVs: 5,
  everstoneChance: 1.0,
  hasDestinyKnot: true,
  inheritableTraits: [
    "nature",
    "iv_hp",
    "iv_attack",
    "iv_defense",
    "iv_specialAttack",
    "iv_specialDefense",
    "iv_speed",
    "eggMove",
  ],
};

const MECHANICS_DB = {
  3: [
    {
      id: "physical_special_split",
      name: "Physical/Special Split",
      category: "Battle",
      availability: "Unavailable",
      supportLevel: "FullySupported",
      description: "Daño según tipo elemental.",
    },
    {
      id: "fairy_type",
      name: "Fairy Type",
      category: "Types",
      availability: "Unavailable",
      supportLevel: "NotApplicable",
      description: "No existía.",
    },
  ],
  6: [
    {
      id: "physical_special_split",
      name: "Physical/Special Split",
      category: "Battle",
      availability: "Available",
      supportLevel: "FullySupported",
      description: "Daño según categoría del movimiento.",
    },
    {
      id: "fairy_type",
      name: "Fairy Type",
      category: "Types",
      availability: "Available",
      supportLevel: "FullySupported",
      description: "Introducido en Gen 6.",
    },
  ],
  9: [
    {
      id: "physical_special_split",
      name: "Physical/Special Split",
      category: "Battle",
      availability: "Available",
      supportLevel: "FullySupported",
      description: "Daño según categoría.",
    },
    {
      id: "fairy_type",
      name: "Fairy Type",
      category: "Types",
      availability: "Available",
      supportLevel: "FullySupported",
      description: "Tipo Hada.",
    },
    {
      id: "terastallization",
      name: "Terastallization",
      category: "SpecialMechanics",
      availability: "Available",
      supportLevel: "FullySupported",
      description: "Cambia el tipo del Pokémon.",
    },
  ],
} as const satisfies Record<number, ReadonlyArray<MechanicStatus>>;

const CACHE = new Map<number, GenerationRuleset>();

export const GenerationRulesProvider = {
  getRuleset(generation: number): GenerationRuleset {
    const cached = CACHE.get(generation);
    if (cached) return cached;

    let ruleset: GenerationRuleset;
    switch (generation) {
      case 3:
        ruleset = new GenerationRuleset(
          3,
          "Hoenn",
          MECHANICS_DB[3],
          GEN_3_BREEDING,
        );
        break;
      case 6:
        ruleset = new GenerationRuleset(
          6,
          "Kalos",
          MECHANICS_DB[6],
          GEN_6_BREEDING,
        );
        break;
      case 9:
        ruleset = new GenerationRuleset(
          9,
          "Paldea",
          MECHANICS_DB[9],
          GEN_9_BREEDING,
        );
        break;
      default:
        throw new Error(
          `Ruleset para Gen ${generation} no definido. Soportadas: ${GenerationRulesProvider.listSupported().join(", ")}`,
        );
    }
    CACHE.set(generation, ruleset);
    return ruleset;
  },

  isSupported(generation: number): boolean {
    return [3, 6, 9].includes(generation);
  },

  listSupported(): number[] {
    return [3, 6, 9];
  },
};
