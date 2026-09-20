export type PokemonId = number;
export type PokemonName = string;

export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "grass"
  | "electric"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type PokemonTypeName = PokemonType;

export interface PokemonAbilityRef {
  name: string;
  isHidden: boolean;
  slot: number;
}

export interface PokemonMoveRef {
  name: string;
  learnMethod: string;
  levelLearnedAt: number;
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  "special-attack": number;
  "special-defense": number;
  speed: number;
}

export interface Pokemon {
  id: PokemonId;
  name: PokemonName;
  types: PokemonType[];
  baseStats: BaseStats;
  height: number;
  weight: number;
  abilities: PokemonAbilityRef[];
  moves: PokemonMoveRef[];
}

export type PokemonList = Pokemon[];
