import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export const ALL_POKEMON_TYPES: readonly PokemonType[] = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
} as const;

const ABILITY_IMMUNITIES: Readonly<Record<string, PokemonType>> = Object.freeze(
  {
    levitate: "ground",
    "earth-eater": "ground",
    "water-absorb": "water",
    "storm-drain": "water",
    "dry-skin": "water",
    "sap-sipper": "grass",
    "volt-absorb": "electric",
    "motor-drive": "electric",
    "lightning-rod": "electric",
    "flash-fire": "fire",
    "well-baked-body": "fire",
    "wonder-guard": "__special__" as unknown as PokemonType,
  },
);

const ITEM_IMMUNITIES: Readonly<Record<string, PokemonType>> = Object.freeze({
  "air-balloon": "ground",
});

const ABILITY_RESISTANCES: Readonly<Record<string, readonly PokemonType[]>> =
  Object.freeze({
    "thick-fat": ["fire", "ice"],
    heatproof: ["fire"],
    "water-bubble": ["fire"],
    "purifying-salt": ["ghost"],
    fluffy: ["fire"],
  });

const BERRY_RESISTANCES: Readonly<Record<string, PokemonType>> = Object.freeze({
  "occa-berry": "fire",
  "passho-berry": "water",
  "wacan-berry": "electric",
  "rindo-berry": "grass",
  "yache-berry": "ice",
  "chople-berry": "fighting",
  "kebia-berry": "poison",
  "shuca-berry": "ground",
  "coba-berry": "flying",
  "payapa-berry": "psychic",
  "tanga-berry": "bug",
  "charti-berry": "rock",
  "kasib-berry": "ghost",
  "haban-berry": "dragon",
  "colbur-berry": "dark",
  "babiri-berry": "steel",
  "roseli-berry": "fairy",
});

function getImmunity(
  abilityId: string | null | undefined,
  itemId: string | null | undefined,
): PokemonType | null {
  const ab = ABILITY_IMMUNITIES[normalizeId(abilityId)];
  if (ab) return ab;
  const it = ITEM_IMMUNITIES[normalizeId(itemId)];
  if (it) return it;
  return null;
}

function getResistancesFromAbility(
  abilityId: string | null | undefined,
): readonly PokemonType[] {
  if (!abilityId) return [];
  const key = normalizeId(abilityId);
  return ABILITY_RESISTANCES[key] ?? [];
}

function getBerryResistance(
  itemId: string | null | undefined,
): PokemonType | null {
  if (!itemId) return null;
  const key = normalizeId(itemId);
  return BERRY_RESISTANCES[key] ?? null;
}

function getMultiplier(
  attackType: PokemonType,
  defenderTypes: readonly PokemonType[],
  abilityId: string | null | undefined = null,
  itemId: string | null | undefined = null,
): number {
  const atk = normalizeId(attackType) as PokemonType;

  if (normalizeId(abilityId) === "wonder-guard") {
  }

  const immunity = getImmunity(abilityId, itemId);
  if (immunity && immunity === atk) return 0;

  const chart = TYPE_CHART[atk] ?? {};
  let multiplier = 1;

  for (const def of defenderTypes) {
    const defNorm = normalizeId(def) as PokemonType;
    const m = chart[defNorm];
    if (m !== undefined) {
      multiplier *= m;
      if (multiplier === 0) return 0;
    }
  }

  const abilityResists = getResistancesFromAbility(abilityId);
  if (abilityResists.includes(atk)) {
    multiplier *= 0.5;
  }

  if (normalizeId(abilityId) === "fluffy" && atk === "fire") {
    multiplier *= 2;
  }

  if (normalizeId(abilityId) === "wonder-guard") {
    return multiplier > 1 ? multiplier : 0;
  }

  return multiplier;
}

function getMitigationSource(
  attackType: PokemonType,
  abilityId: string | null | undefined,
  itemId: string | null | undefined,
): string | null {
  const atk = normalizeId(attackType) as PokemonType;
  const ability = normalizeId(abilityId);
  const item = normalizeId(itemId);

  if (ABILITY_IMMUNITIES[ability] === atk) return `Habilidad ${ability}`;
  if (ITEM_IMMUNITIES[item] === atk) return `Objeto ${item}`;
  if (getResistancesFromAbility(ability).includes(atk))
    return `Habilidad ${ability} resiste ${atk}`;
  if (getBerryResistance(item) === atk) return `Baya ${item} reduce ${atk}`;
  return null;
}

export const TypeEffectiveness = Object.freeze({
  getMultiplier,
  getImmunity,
  getResistancesFromAbility,
  getBerryResistance,
  getMitigationSource,
  getAllTypes: (): readonly PokemonType[] => ALL_POKEMON_TYPES,
  getChart: () => TYPE_CHART,
  ABILITY_IMMUNITIES,
  ITEM_IMMUNITIES,
  ABILITY_RESISTANCES,
  BERRY_RESISTANCES,
});
