export type BattleValidationError =
  | "MISSING_ATTACKER"
  | "MISSING_DEFENDER"
  | "INVALID_FORM"
  | "MISSING_MOVE"
  | "INVALID_MOVE_DATA"
  | "MISSING_STATS"
  | "INVALID_BATTLE_CONTEXT"
  | "UNSUPPORTED_FORM_FOR_GENERATION";

export interface ValidationResult {
  valid: boolean;
  errors: BattleValidationError[];
  messages: Record<BattleValidationError, string>;
  details?: BattleStateForValidation;
}

type StatRecord = Record<string, number>;
type UnknownRecord = Record<string, unknown>;

export interface BattlePokemonForValidation {
  id: number;
  name: string;
  level?: number;
  nature?: string | UnknownRecord;
  evs?: StatRecord;
  ivs?: StatRecord;
  ability?: string;
  item?: string;
  stats?: StatRecord;
  baseStats?: StatRecord;
}

export interface BattleMoveForValidation {
  name: string;
  power?: number | null;
  type?: string;
  category?: string;
}

export interface BattleStateForValidation {
  attacker?: BattlePokemonForValidation | null;
  defender?: BattlePokemonForValidation | null;
  move?: BattleMoveForValidation | null;
  generation?: number | string;
}

const DEBUT_GENERATION: Record<string, number> = {
  palafin: 9,
  "palafin-zero": 9,
  "palafin-hero": 9,
  cyclizar: 9,
  "urshifu-single-strike": 8,
  "urshifu-rapid-strike": 8,
  "urshifu-single-strike-gmax": 8,
  "urshifu-rapid-strike-gmax": 8,
  zygarde: 6,
  "zygarde-50": 6,
  "zygarde-10": 7,
  "zygarde-complete": 7,
};

function getDebutGen(name: string): number {
  const lower = name.toLowerCase();
  if (DEBUT_GENERATION[lower] !== undefined) return DEBUT_GENERATION[lower];
  const base = lower.split("-")[0];
  if (DEBUT_GENERATION[base] !== undefined) return DEBUT_GENERATION[base];
  if (lower.includes("mega")) return 6;
  if (lower.includes("gmax") || lower.includes("gigantamax")) return 8;
  return 1;
}

const ERROR_MESSAGES: Record<BattleValidationError, string> = {
  MISSING_ATTACKER: "Elige tu Pokémon atacante",
  MISSING_DEFENDER: "Elige tu Pokémon defensor",
  INVALID_FORM: "Forma no válida",
  MISSING_MOVE: "Elige un movimiento",
  INVALID_MOVE_DATA: "Movimiento sin datos válidos",
  MISSING_STATS: "Sin estadísticas base",
  INVALID_BATTLE_CONTEXT: "Generación no válida",
  UNSUPPORTED_FORM_FOR_GENERATION: "No disponible en esta generación",
};

export function validateBattleState(
  state: BattleStateForValidation,
): ValidationResult {
  const errors: BattleValidationError[] = [];
  const messages = { ...ERROR_MESSAGES } as Record<
    BattleValidationError,
    string
  >;

  const GEN_NAMES: Record<number, string> = {
    1: "Rojo/Azul",
    2: "Oro/Plata",
    3: "Rubí/Zafiro",
    4: "Diamante/Perla",
    5: "Negro/Blanco",
    6: "X/Y",
    7: "Sol/Luna",
    8: "Espada/Escudo",
    9: "Escarlata/Violeta",
  };

  if (!state.attacker?.id) {
    errors.push("MISSING_ATTACKER");
  } else {
    const hasStats = Boolean(state.attacker.stats || state.attacker.baseStats);
    if (!hasStats) {
      errors.push("MISSING_STATS");
      messages.MISSING_STATS = `Atacante ${state.attacker.name} sin estadísticas`;
    }
    if (!state.attacker.name || state.attacker.name.trim() === "") {
      errors.push("INVALID_FORM");
    }
    if (state.generation !== undefined) {
      const genNum =
        typeof state.generation === "string"
          ? Number.parseInt(state.generation, 10)
          : state.generation;
      if (typeof genNum === "number") {
        const debut = getDebutGen(state.attacker.name);
        if (genNum < debut) {
          errors.push("UNSUPPORTED_FORM_FOR_GENERATION");
          const debutName = GEN_NAMES[debut] || `Gen ${debut}`;
          const genName = GEN_NAMES[genNum] || `Gen ${genNum}`;
          messages.UNSUPPORTED_FORM_FOR_GENERATION = `${state.attacker.name} es de ${debutName}, no existe en ${genName}`;
        }
      }
    }
  }

  if (!state.defender?.id) {
    errors.push("MISSING_DEFENDER");
  } else {
    const hasStats = Boolean(state.defender.stats || state.defender.baseStats);
    if (!hasStats) {
      if (!errors.includes("MISSING_STATS")) {
        errors.push("MISSING_STATS");
      }
      messages.MISSING_STATS = `Defensor ${state.defender.name} sin estadísticas`;
    }
    if (state.generation !== undefined) {
      const genNum =
        typeof state.generation === "string"
          ? Number.parseInt(state.generation, 10)
          : state.generation;
      if (typeof genNum === "number") {
        const debut = getDebutGen(state.defender.name);
        if (genNum < debut) {
          if (!errors.includes("UNSUPPORTED_FORM_FOR_GENERATION")) {
            errors.push("UNSUPPORTED_FORM_FOR_GENERATION");
          }
          const debutName = GEN_NAMES[debut] || `Gen ${debut}`;
          const genName = GEN_NAMES[genNum] || `Gen ${genNum}`;
          messages.UNSUPPORTED_FORM_FOR_GENERATION = `${state.defender.name} es de ${debutName}, no existe en ${genName}`;
        }
      }
    }
  }

  if (!state.move?.name) {
    errors.push("MISSING_MOVE");
  } else {
    const hasType = Boolean(state.move.type);
    if (!hasType) {
      errors.push("INVALID_MOVE_DATA");
      messages.INVALID_MOVE_DATA = `Movimiento ${state.move.name} sin tipo`;
    }
  }

  if (state.generation !== undefined) {
    const genNum =
      typeof state.generation === "string"
        ? Number.parseInt(state.generation, 10)
        : state.generation;
    if (typeof genNum === "number" && (genNum < 1 || genNum > 9)) {
      errors.push("INVALID_BATTLE_CONTEXT");
      messages.INVALID_BATTLE_CONTEXT = `Generación ${genNum} fuera de rango (1-9)`;
    }
  }

  return { valid: errors.length === 0, errors, messages, details: state };
}
