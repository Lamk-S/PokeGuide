export const AbilityId = {
  GUTS: "guts",
  INTIMIDATE: "intimidate",
  FLASH_FIRE: "flash-fire",
  LEVITATE: "levitate",
} as const;

export type AbilityId = (typeof AbilityId)[keyof typeof AbilityId] | string;

/**
 * Normaliza un ability name o label a ID interno
 * Acepta tanto inglés como español, pero siempre retorna ID estable
 */
export function normalizeAbilityId(
  input: string | undefined,
): string | undefined {
  if (!input) return undefined;

  const lower = input.toLowerCase().trim();

  const abilityMap: Record<string, string> = {
    // Guts
    guts: AbilityId.GUTS,
    agallas: AbilityId.GUTS,
    agalla: AbilityId.GUTS,
    // Intimidate
    intimidate: AbilityId.INTIMIDATE,
    intimidación: AbilityId.INTIMIDATE,
    intimidacion: AbilityId.INTIMIDATE,
    // Otros
    "flash fire": AbilityId.FLASH_FIRE,
    "absorbe fuego": AbilityId.FLASH_FIRE,
    levitate: AbilityId.LEVITATE,
    levitación: AbilityId.LEVITATE,
    levitacion: AbilityId.LEVITATE,
  };

  if (abilityMap[lower]) {
    return abilityMap[lower];
  }

  return lower.replace(/\s+/g, "-");
}

export function isGutsAbility(abilityId: string | undefined): boolean {
  if (!abilityId) return false;
  return normalizeAbilityId(abilityId) === AbilityId.GUTS;
}
