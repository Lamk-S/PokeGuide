import type {
  Pokemon,
  PokemonAbilityRef,
} from "@/domain/pokemon/types/pokemon";

/**
 * Obtiene la lista de habilidades legales de un Pokémon para una generación específica.
 */
function getLegalAbilities(
  pokemon: Pokemon,
  generation: number,
): PokemonAbilityRef[] {
  // Nota histórica: Las habilidades ocultas se introdujeron en Gen 5.
  // Si la generación solicitada es < 5, se filtran las habilidades ocultas.
  if (generation < 5) {
    return pokemon.abilities.filter((a) => !a.isHidden);
  }

  // Gen 5+ soporta todas las habilidades declaradas por la especie.
  return pokemon.abilities;
}

/**
 * Valida si una habilidad dada es legal para el Pokémon en la generación dada.
 */
function isLegal(
  abilityName: string,
  pokemon: Pokemon,
  generation: number,
): boolean {
  const legalAbilities = getLegalAbilities(pokemon, generation);
  return legalAbilities.some((a) => a.name === abilityName);
}

/**
 * Servicio de Dominio: Determina la legalidad de las habilidades.
 * Exportado como un objeto inmutable para mantener la consistencia del API
 * sin recurrir a clases estáticas (Antipatrón en TypeScript).
 */
export const AbilityLegalityService = {
  getLegalAbilities,
  isLegal,
} as const;
