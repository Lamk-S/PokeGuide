import {
  validateBattleState,
  type BattleValidationState,
  type BattleValidationResult,
} from "./BattleValidation";

export function createBattleValidator(): {
  validate: (state: BattleValidationState) => BattleValidationResult;
} {
  return { validate: validateBattleState };
}

export const BattleValidationFactory = {
  create: createBattleValidator,
  validate: validateBattleState,
};
