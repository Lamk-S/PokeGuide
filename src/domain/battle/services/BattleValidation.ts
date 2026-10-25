export type BattleValidationErrorCode =
  | "MISSING_ATTACKER"
  | "MISSING_DEFENDER"
  | "MISSING_MOVE"
  | "INVALID_GENERATION";

export type BattleValidationExtendedError =
  | "INVALID_FORM"
  | "INVALID_MOVE_DATA"
  | "MISSING_STATS"
  | "INVALID_BATTLE_CONTEXT"
  | "UNSUPPORTED_FORM_FOR_GENERATION"
  | "FORM_NOT_AVAILABLE"
  | "MOVE_NOT_LEARNABLE"
  | "INVALID_LEVEL"
  | "INVALID_NATURE";

export type BattleValidationError =
  | BattleValidationErrorCode
  | BattleValidationExtendedError;

export interface BattleValidationState {
  attacker: unknown | null;
  defender: unknown | null;
  move: unknown | null;
  generation: number;
}

export interface BattleValidationResult {
  valid: boolean;
  errors: BattleValidationError[];
}

const MIN_SUPPORTED_GEN = 1;
const MAX_SUPPORTED_GEN = 9;

function isEmptyMove(move: unknown): boolean {
  if (move === null || move === undefined) return true;
  if (typeof move === "string" && move.trim().length === 0) return true;
  return false;
}

export function validateBattleState(
  state: BattleValidationState,
): BattleValidationResult {
  const { attacker, defender, move, generation } = state;

  if (!Number.isFinite(generation) || generation <= 0) {
    throw new Error(
      `CORRUPT_GENERATION: generation ${generation} is invalid. Must be > 0`,
    );
  }

  const errors: BattleValidationError[] = [];

  if (attacker === null || attacker === undefined) {
    errors.push("MISSING_ATTACKER");
  }

  if (defender === null || defender === undefined) {
    errors.push("MISSING_DEFENDER");
  }

  if (isEmptyMove(move)) {
    errors.push("MISSING_MOVE");
  }

  if (
    !Number.isInteger(generation) ||
    generation < MIN_SUPPORTED_GEN ||
    generation > MAX_SUPPORTED_GEN
  ) {
    errors.push("INVALID_GENERATION");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
