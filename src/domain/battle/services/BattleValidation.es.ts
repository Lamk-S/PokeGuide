import type { BattleValidationState } from "./BattleValidation";

export const VALIDATION_ES: Record<string, string> = {
  MISSING_ATTACKER: "atacante",
  MISSING_DEFENDER: "defensor",
  MISSING_MOVE: "movimiento",
  MISSING_POKEMON: "Pokémon",
  MISSING_STATS: "estadísticas",
  INVALID_GENERATION: "generación inválida",
  INVALID_BATTLE_CONTEXT: "contexto de batalla",
  UNSUPPORTED_FORM_FOR_GENERATION: "forma no disponible en esta generación",
  FORM_NOT_AVAILABLE: "forma no disponible",
  INVALID_FORM: "forma inválida",
  INVALID_MOVE_DATA: "datos del movimiento",
  MOVE_NOT_LEARNABLE: "movimiento no aprendible",
  INVALID_LEVEL: "nivel inválido",
  INVALID_NATURE: "naturaleza inválida",
  INVALID_EVS: "EVs inválidos",
  INVALID_IVS: "IVs inválidos",
  INVALID_ABILITY: "habilidad inválida",
  INVALID_ITEM: "objeto inválido",
};

export function translateValidationErrors(errors: string[]): string[] {
  return errors.map(
    (e) => VALIDATION_ES[e] ?? e.replace(/_/g, " ").toLowerCase(),
  );
}

export function getValidationSummaryES(state: BattleValidationState): string {
  if (state.valid) return "Listo para calcular";
  const msgs = translateValidationErrors(state.errors as string[]);
  return `Falta: ${msgs.join(" · ")}. Completa atacante, defensor y movimiento.`;
}
