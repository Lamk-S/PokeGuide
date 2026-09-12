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

// Define cómo un Pokémon aprende un movimiento
export interface PokemonMoveRef {
  name: string;
  learnMethod: "level-up" | "machine";
  levelLearnedAt: number; // 0 si es por máquina (MT/MO)
}

export interface Pokemon {
  id: PokemonId;
  name: PokemonName;
  types: PokemonType[];
  baseStats: Record<StatName, number>;
  height: number;
  weight: number;
  abilities: string[];
  moves: PokemonMoveRef[];
}
