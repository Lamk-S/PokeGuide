import { DEBUT_GENERATION } from "@/domain/pokemon/services/PokemonFormResolver";

export type BattleValidationError =
  | "MISSING_ATTACKER"
  | "MISSING_DEFENDER"
  | "MISSING_MOVE"
  | "INVALID_FORM"
  | "INVALID_MOVE_DATA"
  | "MISSING_STATS"
  | "INVALID_BATTLE_CONTEXT"
  | "INVALID_GENERATION"
  | "FORM_NOT_AVAILABLE"
  | "MOVE_NOT_LEARNABLE"
  | "INVALID_LEVEL"
  | "INVALID_NATURE"
  | "UNSUPPORTED_FORM_FOR_GENERATION";

interface BattleStateInput {
  attacker: {
    id: number;
    name: string;
    stats?: Record<string, number>;
    baseStats?: Record<string, number>;
    level?: number;
  } | null;
  defender: {
    id: number;
    name: string;
    stats?: Record<string, number>;
    baseStats?: Record<string, number>;
    level?: number;
  } | null;
  move: { name: string; power?: number | null; type?: string } | null;
  generation: number;
}

export function validateBattleState(input: BattleStateInput) {
  const errors: BattleValidationError[] = [];
  if (!input.attacker) errors.push("MISSING_ATTACKER");
  if (!input.defender) errors.push("MISSING_DEFENDER");
  if (!input.move) errors.push("MISSING_MOVE");
  if (input.attacker && !input.attacker.stats && !input.attacker.baseStats)
    errors.push("MISSING_STATS");
  if (input.defender && !input.defender.stats && !input.defender.baseStats)
    errors.push("MISSING_STATS");
  if (input.generation < 3 || input.generation > 9)
    errors.push("INVALID_BATTLE_CONTEXT");
  if (input.generation < 1 || input.generation > 9)
    errors.push("INVALID_GENERATION");
  return { valid: errors.length === 0, errors };
}

export function getFormDebut(rawName: string): number | undefined {
  if (!rawName) return undefined;
  const parts = rawName.split("-");
  const base = parts[0];
  if (!base) return undefined;
  const maybe = DEBUT_GENERATION[base];
  if (maybe !== undefined) return maybe;
  return DEBUT_GENERATION[rawName];
}
