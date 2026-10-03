import type { PokemonType } from "@/domain/pokemon/types/pokemon";

export const TYPE_TRANSLATIONS_ES: Readonly<Record<PokemonType, string>> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
} as const;

export function translateTypeToSpanish(type: string): string {
  const key = type.toLowerCase() as PokemonType;
  return TYPE_TRANSLATIONS_ES[key] ?? type;
}
