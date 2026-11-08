import type {
  BattleValidationInput,
  BattleValidationState,
} from "./BattleValidation";
import { validateBattleState } from "./BattleValidation";

export interface IBattleValidator {
  readonly validate: (state: BattleValidationInput) => BattleValidationState;
}

export type BattleValidatorFactoryOptions = {
  readonly validator?: (state: BattleValidationInput) => BattleValidationState;
};

export function createBattleValidator(
  options: BattleValidatorFactoryOptions = {},
): IBattleValidator {
  const validateFn = options.validator ?? validateBattleState;
  return {
    validate: (state: BattleValidationInput) => validateFn(state),
  };
}

export const BattleValidationFactory = {
  create: createBattleValidator,
  validate: validateBattleState,
} as const;
