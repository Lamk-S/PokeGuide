export type PokemonId = number;
export type PokemonName = string;
export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";
export type PokemonType = string;

export interface BaseStat {
  name: StatName;
  value: number;
}

// Entidad principal purgada de datos basura de PokeAPI
export interface Pokemon {
  id: PokemonId;
  name: PokemonName;
  types: PokemonType[];
  baseStats: Record<StatName, number>;
  height: number;
  weight: number;
}
