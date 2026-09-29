import { normalizeAbilityId } from "../value-objects/AbilityId";
import { normalizeMoveId } from "../value-objects/MoveId";

export interface RawBattleParticipantInput {
  pokemonId?: number;
  id?: number;
  name?: string;
  level: number;
  nature: { name: string; nameEs?: string };
  evs: Record<string, number>;
  ivs: Record<string, number>;
  ability?: string;
  abilityId?: string;
  item?: string;
  status?: string;
  isCriticalHit?: boolean;
}

export interface RawBattleScenario {
  attacker: RawBattleParticipantInput;
  defender: RawBattleParticipantInput;
  moveName: string;
  moveId?: string;
  generation: number;
  conditions: {
    weather: string;
    terrain: string;
    isCriticalHit?: boolean;
  };
}

export interface NormalizedBattleParticipant {
  id: number;
  name: string;
  level: number;
  nature: { name: string; nameEs?: string };
  evs: Record<string, number>;
  ivs: Record<string, number>;
  ability: string | undefined;
  abilityId: string | undefined;
  item: string | undefined;
  status: string | undefined;
  isCriticalHit: boolean;
}

export interface NormalizedBattleScenario {
  attacker: NormalizedBattleParticipant;
  defender: NormalizedBattleParticipant;
  moveName: string;
  moveId: string;
  moveDisplayName: string;
  generation: number;
  conditions: {
    weather: string;
    terrain: string;
  };
}

export function normalizeBattleScenario(
  raw: RawBattleScenario,
): NormalizedBattleScenario {
  // Normalizar atacante
  const attackerAbilityId =
    raw.attacker.abilityId || normalizeAbilityId(raw.attacker.ability);

  const attacker: NormalizedBattleParticipant = {
    id: raw.attacker.pokemonId || raw.attacker.id || 0,
    name: raw.attacker.name || "",
    level: raw.attacker.level,
    nature: raw.attacker.nature,
    evs: raw.attacker.evs,
    ivs: raw.attacker.ivs,
    ability: raw.attacker.ability,
    abilityId: attackerAbilityId,
    item: raw.attacker.item,
    status: raw.attacker.status,
    isCriticalHit:
      raw.attacker.isCriticalHit ?? raw.conditions.isCriticalHit ?? false,
  };

  // Normalizar defensor (crítico no aplica, pero se preserva por consistencia)
  const defenderAbilityId =
    raw.defender.abilityId || normalizeAbilityId(raw.defender.ability);

  const defender: NormalizedBattleParticipant = {
    id: raw.defender.pokemonId || raw.defender.id || 0,
    name: raw.defender.name || "",
    level: raw.defender.level,
    nature: raw.defender.nature,
    evs: raw.defender.evs,
    ivs: raw.defender.ivs,
    ability: raw.defender.ability,
    abilityId: defenderAbilityId,
    item: raw.defender.item,
    status: raw.defender.status,
    isCriticalHit: raw.defender.isCriticalHit ?? false,
  };

  const moveId =
    raw.moveId ||
    normalizeMoveId(raw.moveName) ||
    raw.moveName.toLowerCase().replace(/\s+/g, "-");

  return {
    attacker,
    defender,
    moveName: moveId,
    moveId,
    moveDisplayName: raw.moveName,
    generation: raw.generation,
    conditions: {
      weather: raw.conditions.weather,
      terrain: raw.conditions.terrain,
    },
  };
}
