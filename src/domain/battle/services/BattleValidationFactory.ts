import {
  type BattleValidationInput,
  type BattleValidationState,
  validateBattleState,
} from "./BattleValidation";

export function createBattleValidator(): {
  validate: (state: BattleValidationInput) => BattleValidationState;
} {
  return { validate: validateBattleState };
}

export const BattleValidationFactory = {
  create: createBattleValidator,
  validate: validateBattleState,
};
