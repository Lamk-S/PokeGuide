import type {
  BattleConditions,
  StatusId,
} from "../value-objects/BattleModifiers";
import type { MoveCategory } from "../value-objects/MoveCategory";

export interface BattleParticipant {
  id: number;
  name: string;
  level: number;
  nature: { name: string; nameEs?: string | undefined };
  evs: Record<string, number>;
  ivs: Record<string, number>;
  ability?: string | undefined;
  abilityId?: string | undefined;
  item?: string | undefined;
  status?: StatusId | undefined;
  isCriticalHit?: boolean | undefined;
}

export interface BattleScenario {
  attacker: BattleParticipant;
  defender: BattleParticipant;
  moveName: string;
  moveId?: string | undefined;
  moveDisplayName?: string | undefined;
  generation: number;
  conditions: BattleConditions;
  moveCategory?: MoveCategory | undefined;
}

export interface AttackAction {
  attacker: BattleParticipant;
  defender: BattleParticipant;
  moveId: string;
  moveCategory: MoveCategory;
  isCriticalHit: boolean;
  generation: number;
  conditions: BattleConditions;
}
