import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type {
  ActionableRecommendation,
  DefensiveReport,
  LegalityReport,
  OffensiveReport,
  RecommendationCategory,
  RecommendationIssueCode,
  RoleReport,
  Severity,
  TypeExposure,
  UtilityReport,
} from "@/domain/team/types/TeamTypes";

export interface PureTeamRecommendation {
  readonly id: string;
  readonly severity: Severity;
  readonly issueCode: RecommendationIssueCode;
  readonly category: RecommendationCategory;
  readonly attackingType: string;
  readonly targetType: string;
  readonly evidence: TypeExposure;
  readonly weak: number;
  readonly resist: number;
  readonly immune: number;
  readonly neutral: number;
}

type CoverageMap = Record<string, TypeExposure>;

interface MasterReport {
  defensive: DefensiveReport;
  offensive: OffensiveReport;
  utility: UtilityReport;
  roles: RoleReport;
  legality: LegalityReport;
}

type LooseRecord = Record<string, unknown>;

function isRecord(value: unknown): value is LooseRecord {
  return typeof value === "object" && value !== null;
}

function buildId(...parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

function priorityFromSeverity(sev: Severity): number {
  switch (sev) {
    case "Critical":
      return 100;
    case "High":
      return 75;
    case "Medium":
      return 50;
    case "Low":
      return 25;
    default:
      return 10;
  }
}

function isCoverageMap(input: unknown): input is CoverageMap {
  if (!isRecord(input)) return false;
  if ("defensive" in input) return false;
  const values = Object.values(input);
  if (values.length === 0) return true;
  const first = values[0];
  return (
    isRecord(first) && typeof (first as { weak?: unknown }).weak === "number"
  );
}

function isMasterReport(input: unknown): input is MasterReport {
  return isRecord(input) && "defensive" in input && "offensive" in input;
}

function generateLegacy(coverage: CoverageMap): PureTeamRecommendation[] {
  const recommendations: PureTeamRecommendation[] = [];

  for (const [attackingType, exposure] of Object.entries(coverage)) {
    const totalResist = exposure.resist + exposure.immune;

    if (exposure.weak >= 3 && totalResist <= 1) {
      recommendations.push({
        id: `${attackingType}-massive_weakness-${exposure.weak}-${exposure.resist}`,
        severity: "Critical",
        issueCode: "massive_weakness",
        category: "defensive_gap",
        attackingType,
        targetType: attackingType,
        evidence: exposure,
        weak: exposure.weak,
        resist: exposure.resist,
        immune: exposure.immune,
        neutral: exposure.neutral,
      });
      continue;
    }

    if (exposure.weak === 2 && exposure.resist === 1 && exposure.immune === 0) {
      recommendations.push({
        id: `${attackingType}-single_point_failure-${exposure.weak}-${exposure.resist}`,
        severity: "High",
        issueCode: "single_point_failure",
        category: "dependency",
        attackingType,
        targetType: attackingType,
        evidence: exposure,
        weak: exposure.weak,
        resist: exposure.resist,
        immune: exposure.immune,
        neutral: exposure.neutral,
      });
      continue;
    }

    if (exposure.weak >= 2 && totalResist === 0) {
      recommendations.push({
        id: `${attackingType}-massive_weakness-${exposure.weak}-${exposure.resist}-2`,
        severity: "High",
        issueCode: "massive_weakness",
        category: "defensive_gap",
        attackingType,
        targetType: attackingType,
        evidence: exposure,
        weak: exposure.weak,
        resist: exposure.resist,
        immune: exposure.immune,
        neutral: exposure.neutral,
      });
    }
  }

  return recommendations;
}

function generateActionable(master: MasterReport): ActionableRecommendation[] {
  const recs: ActionableRecommendation[] = [];

  if (!master.legality.isLegal) {
    for (const issue of master.legality.issues) {
      const sev: Severity = issue.severity;
      recs.push({
        id: buildId("legality", issue.code, issue.membersInvolved.join("-")),
        severity: sev,
        category: "legality",
        issueCode: issue.code as RecommendationIssueCode,
        problemDescription:
          issue.code === "species_clause"
            ? `Species Clause violada: ${issue.message}. En formato ${master.legality.format} no puedes repetir especie.`
            : issue.code === "item_clause"
              ? `Item Clause: ${issue.message}. Considera diversificar objetos para maximizar recursos.`
              : issue.message,
        evidence: [
          issue.message,
          `Miembros involucrados: ${issue.membersInvolved.join(", ")}`,
        ],
        actionableAdvice:
          issue.code === "species_clause"
            ? "Cambia uno de los duplicados por un Pokémon con rol similar pero distinta especie. Ej: si duplicas Landorus, prueba con Gliscor o Garchomp como alternativa defensiva."
            : issue.code === "item_clause"
              ? "Asigna objetos distintos: Restos a uno, Casco Dentado a otro, Botas Gruesas al tercero. Prioriza Leftovers al más bulky."
              : "Corrige EVs/Nivel para cumplir reglas del formato.",
        relatedMemberIds: issue.membersInvolved,
        priorityScore: priorityFromSeverity(sev) + 20,
      });
    }
  }

  for (const type of master.defensive.criticalWeaknesses) {
    const exp = master.defensive.coverage[type];
    if (!exp) continue;
    recs.push({
      id: buildId("def", "massive_weakness", type),
      severity: "Critical",
      category: "defensive_gap",
      issueCode: "massive_weakness",
      problemDescription: `El equipo tiene ${exp.weak} Pokémon débiles a ${type.toUpperCase()} y solo ${exp.resist + exp.immune} resistencias. Un atacante ${type} puede barrer a varios integrantes.`,
      evidence: [
        `Débil: ${exp.weak}, Resiste: ${exp.resist}, Inmune: ${exp.immune}`,
        `Switch-ins seguros: ${master.defensive.safeSwitchIns.find((s) => s.type === type)?.count ?? 0}`,
      ],
      actionableAdvice: `Añade un Pokémon que resista ${type} o con inmunidad. Ej: para ${type} prueba con tipos resistentes o habilidad que mitigue.`,
      priorityScore: 95,
      attackingType: type as PokemonType,
      targetType: type as PokemonType,
    });
  }

  if (master.offensive.uncoveredTypes.length > 6) {
    const uncovered = master.offensive.uncoveredTypes.slice(0, 3).join(", ");
    recs.push({
      id: buildId("off", "low_coverage"),
      severity: "High",
      category: "offensive_gap",
      issueCode: "offensive_coverage_gap",
      problemDescription: `Cobertura ofensiva baja: ${master.offensive.coveragePercent}% cubierto. No golpeas super-eficaz a ${uncovered} entre otros.`,
      evidence: [
        `Cubiertos: ${master.offensive.totalCovered}/${master.offensive.coverage.length}`,
        `Sin cubrir: ${master.offensive.uncoveredTypes.join(", ")}`,
      ],
      actionableAdvice: `Añade movimientos de cobertura clave: Hielo para Tierra/Dragón, Lucha para Acero/Normal, Tierra para Acero/Eléctrico. Prioriza cubrir Acero, que es el tipo más común defensivamente.`,
      priorityScore: 70,
      attackingType: (master.offensive.uncoveredTypes[0] ??
        "normal") as PokemonType,
      targetType: (master.offensive.uncoveredTypes[0] ??
        "normal") as PokemonType,
    });
  }

  if (master.offensive.stallVulnerability) {
    recs.push({
      id: buildId("off", "stall"),
      severity: "Medium",
      category: "utility",
      issueCode: "stall_vulnerability",
      problemDescription:
        "Vulnerabilidad ante stall: el equipo carece de herramientas para romper equipos defensivos (Taunt, Desarme, Mofa, Truco).",
      evidence: [
        `Wallbreaker presente: ${master.offensive.wallbreakerPresent}`,
        `Knock: ${master.utility.hasKnockOff}, Taunt: ${master.utility.hasTaunt}`,
      ],
      actionableAdvice:
        "Incluye al menos una de: Desarme (quita Restos), Mofa (impide Recuperación), Truco (bloquea muro), o un wallbreaker con 130+ Atq. Ej: Taunt en Dragapult, Knock en Meowscarada.",
      priorityScore: 60,
    });
  }

  if (!master.utility.speedControl.isSpeedControlPresent) {
    recs.push({
      id: buildId("speed", "missing"),
      severity: "High",
      category: "speed",
      issueCode: "speed_control_missing",
      problemDescription:
        "Sin control de velocidad: no tienes Viento Afín, Espacio Raro, Onda Trueno, Red Viscosa ni Pañuelo Elegido. Perderás contra equipos más rápidos.",
      evidence: [
        `Métodos detectados: ${master.utility.speedControl.controlMethods.join(", ") || "ninguno"}`,
      ],
      actionableAdvice:
        "Añade 1-2 formas de speed control que sinergicen: Viento Afín para ofensiva rápida, Espacio Raro si tu equipo es lento (<70 base Speed), o un Choice Scarf en un pivote rápido.",
      priorityScore: 80,
    });
  }

  if (master.utility.speedControl.conflict) {
    recs.push({
      id: buildId("speed", "trick_room_conflict"),
      severity: "Medium",
      category: "synergy",
      issueCode: "trick_room_conflict",
      problemDescription:
        "Conflicto de velocidad: tienes Viento Afín y Espacio Raro a la vez. Son estrategias opuestas.",
      evidence: ["Tailwind + Trick Room detectados"],
      actionableAdvice:
        "Elige una: si tu equipo promedio es >90 Speed, quédate con Tailwind. Si es <70, quédate con Trick Room y pon 0 IVs Speed con naturaleza Brave/Quiet.",
      priorityScore: 55,
    });
  }

  if (!master.utility.hazardControl.isHazardControlPresent) {
    recs.push({
      id: buildId("hazard", "missing"),
      severity: "Medium",
      category: "utility",
      issueCode: "hazard_control_missing",
      problemDescription:
        "Sin hazards: no colocas Trampa Rocas ni Púas. Pierdes presión y daño residual clave.",
      evidence: ["No se detectó Stealth Rock/Spikes"],
      actionableAdvice:
        "Añade Trampa Rocas en un defensivo con buen matchup inicial. Ej: Garchomp, Ting-Lu, Glimmora. Es el movimiento con mayor winrate en OU.",
      priorityScore: 50,
    });
  }

  if (
    !master.utility.hazardControl.isRemovalPresent &&
    master.utility.hazardControl.hasHeavyDutyBoots < 2
  ) {
    recs.push({
      id: buildId("hazard", "removal_missing"),
      severity: "Medium",
      category: "utility",
      issueCode: "hazard_removal_missing",
      problemDescription:
        "Sin remoción de hazards y pocas Botas Gruesas. Trampa Rocas te quitará 25-50% cada entrada.",
      evidence: [
        `Botas: ${master.utility.hazardControl.hasHeavyDutyBoots}`,
        `Removers: ${master.utility.hazardControl.removers.join(", ") || "ninguno"}`,
      ],
      actionableAdvice:
        "Añade Despejar o Giro Rápido, o equipa 2-3 Botas Gruesas en pivotes. Ej: Corviknight con Despejar, Great Tusk con Giro Rápido.",
      priorityScore: 60,
    });
  }

  if (!master.utility.hasPivot) {
    recs.push({
      id: buildId("utility", "pivot_missing"),
      severity: "Medium",
      category: "utility",
      issueCode: "pivot_missing",
      problemDescription:
        "Sin movimientos pivote (Ida y Vuelta, Voltiocambio, Viraje). Te faltará momentum para traer checks seguros.",
      evidence: ["No se detectó U-turn/Volt Switch/Flip Turn"],
      actionableAdvice:
        "Añade al menos 2 pivotes: uno físico (U-turn) y uno especial (Volt Switch). Ej: Dragapult con Ida y Vuelta, Rotom-Wash con Voltiocambio.",
      priorityScore: 55,
    });
  }

  if (!master.roles.hasBalancedRoles) {
    for (const missing of master.roles.missingRoles) {
      if (missing === "hazard_setter" || missing === "hazard_remover") continue;
      recs.push({
        id: buildId("role", "missing", missing),
        severity:
          missing === "wall" || missing === "sweeper" ? "High" : "Medium",
        category: "balance",
        issueCode: "balance_issue",
        problemDescription: `Rol faltante: ${missing}. El equipo no cubre todas las funciones competitivas.`,
        evidence: [
          `Roles presentes: ${Object.entries(master.roles.roleCounts)
            .filter(([, c]) => (c as number) > 0)
            .map(([r]) => r)
            .join(", ")}`,
        ],
        actionableAdvice:
          missing === "wall"
            ? "Añade un muro físico o especial con recuperación. Ej: Toxapex, Corviknight, Blissey."
            : missing === "sweeper"
              ? "Añade un sweeper con setup (Danza Dragón, Paz Mental). Ej: Dragonite, Iron Valiant."
              : missing === "speed_controller"
                ? "Añade control de velocidad (ver recomendación speed)."
                : `Considera añadir un Pokémon con rol ${missing}.`,
        priorityScore: missing === "wall" ? 70 : 45,
      });
    }
  }

  for (const redundant of master.roles.redundantRoles) {
    recs.push({
      id: buildId("role", "redundant", redundant),
      severity: "Low",
      category: "redundancy",
      issueCode: "redundant_roles",
      problemDescription: `Redundancia de rol: ${redundant} x${master.roles.roleCounts[redundant]}. Demasiados Pokémon haciendo lo mismo.`,
      evidence: [`Conteo: ${master.roles.roleCounts[redundant]}`],
      actionableAdvice: `Diversifica: cambia uno de los ${redundant} por un rol distinto (ej: si tienes 3 sweepers, cambia uno por un wall o hazard setter).`,
      priorityScore: 20,
    });
  }

  return recs.sort((a, b) => b.priorityScore - a.priorityScore);
}

function generate(
  input: unknown,
): PureTeamRecommendation[] | ActionableRecommendation[] {
  if (isCoverageMap(input)) {
    return generateLegacy(input);
  }
  if (isMasterReport(input)) {
    return generateActionable(input);
  }
  return [];
}

export const RecommendationEngine = Object.freeze({
  generate,
  generateLegacy,
  generateActionable,
});
