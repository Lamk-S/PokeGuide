import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { BattleRuleset } from "@/domain/team/config/battleFormat";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import {
  type MoveMeta,
  OffensiveAnalyzer,
} from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import { RoleHeuristics } from "@/domain/team/services/analyzers/RoleHeuristics";
import { UtilityAndSpeedAnalyzer } from "@/domain/team/services/analyzers/UtilityAndSpeedAnalyzer";
import { TeamLegalityValidator } from "@/domain/team/services/TeamLegalityValidator";
import type {
  ActionableRecommendation,
  DefensiveCoverage,
  DefensiveReport,
  OffensiveCoverage,
  OffensiveReport,
  TeamAnalysis,
  TeamMember,
} from "@/domain/team/types/TeamTypes";
import { ALL_POKEMON_TYPES, TypeEffectiveness } from "@/domain/types/TypeChart";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";

type MoveDTO = {
  readonly id: string;
  readonly type: string;
  readonly power: number | null;
  readonly damageCategory?: string;
  readonly category?: string;
};

function getMoveIds(members: readonly TeamMember[]): string[] {
  const idsMutable: string[] = [];
  for (const m of members) {
    for (const moveId of m.moves) {
      const trimmed = moveId.trim().toLowerCase();
      if (trimmed) idsMutable.push(trimmed);
    }
  }
  return [...new Set(idsMutable)];
}

function toMoveMeta(dto: MoveDTO): MoveMeta {
  const rawCat = (dto.damageCategory ?? dto.category ?? "status").toLowerCase();
  let damageCategory: MoveMeta["damageCategory"] = "status";
  if (rawCat.includes("physical")) damageCategory = "physical";
  else if (rawCat.includes("special")) damageCategory = "special";
  else if (
    rawCat === "physical" ||
    rawCat === "special" ||
    rawCat === "status"
  ) {
    damageCategory = rawCat as MoveMeta["damageCategory"];
  }
  return {
    id: dto.id.toLowerCase(),
    type: dto.type.toLowerCase() as PokemonType,
    power: dto.power,
    damageCategory,
  };
}

function computeDefensiveReport(members: readonly TeamMember[]): {
  coverage: DefensiveCoverage;
  report: DefensiveReport;
} {
  const coverageMutable: Record<
    string,
    { weak: number; resist: number; immune: number; neutral: number }
  > = {};
  const safeSwitchInsMutable: import("@/domain/team/types/TeamTypes").SafeSwitchIns[] =
    [];
  const criticalWeaknessesMutable: PokemonType[] = [];

  for (const atkType of ALL_POKEMON_TYPES) {
    let weak = 0;
    let resist = 0;
    let immune = 0;
    let neutral = 0;
    const resistMembersMutable: string[] = [];
    for (const m of members) {
      const defenderTypes =
        m.isTeraActive && m.teraType ? [m.teraType] : m.types;
      const mult = TypeEffectiveness.getMultiplier(
        atkType,
        defenderTypes as readonly PokemonType[],
        m.abilityId ?? m.ability ?? null,
        m.itemId ?? m.item ?? null,
      );
      if (mult === 0) {
        immune += 1;
        resistMembersMutable.push(m.displayNameEs);
      } else if (mult < 1) {
        resist += 1;
        resistMembersMutable.push(m.displayNameEs);
      } else if (mult > 1) {
        weak += 1;
      } else {
        neutral += 1;
      }
    }
    coverageMutable[atkType] = { weak, resist, immune, neutral };
    if (resistMembersMutable.length > 0) {
      safeSwitchInsMutable.push({
        type: atkType,
        count: resistMembersMutable.length,
        members: Object.freeze([...resistMembersMutable]),
        isSafe: resistMembersMutable.length >= 2,
      });
    }
    if (weak >= 3 && resistMembersMutable.length <= 1) {
      criticalWeaknessesMutable.push(atkType);
    }
  }
  const coverage = Object.freeze(coverageMutable) as DefensiveCoverage;
  const report: DefensiveReport = Object.freeze({
    coverage,
    safeSwitchIns: Object.freeze([...safeSwitchInsMutable]),
    criticalWeaknesses: Object.freeze([
      ...criticalWeaknessesMutable,
    ]) as readonly PokemonType[],
    mitigatedWeaknesses: Object.freeze([]),
  });
  return { coverage, report };
}

function toOffensiveReport(
  offensiveAnalysis: ReturnType<typeof OffensiveAnalyzer.analyze>,
): OffensiveReport {
  const coverageListMutable: OffensiveCoverage[] = [];
  for (const [type, info] of Object.entries(offensiveAnalysis.coverageMap)) {
    coverageListMutable.push({
      type: type as PokemonType,
      superEffectiveHits: info.byMoves.length,
      membersCovering: info.byMoves,
      isCovered: info.covered,
      physicalHits: info.physicalHits,
      specialHits: info.specialHits,
    });
  }
  const uncovered = coverageListMutable.filter((c) => !c.isCovered).length;
  return Object.freeze({
    coverage: Object.freeze([...coverageListMutable]),
    uncoveredTypes: offensiveAnalysis.uncoveredDefenderTypes,
    totalCovered: coverageListMutable.filter((c) => c.isCovered).length,
    coveragePercent: offensiveAnalysis.totalCoveragePercent,
    physicalMoves: offensiveAnalysis.physicalSuperEffective,
    specialMoves: offensiveAnalysis.specialSuperEffective,
    hasPhysicalAttacker: offensiveAnalysis.physicalSuperEffective > 0,
    hasSpecialAttacker: offensiveAnalysis.specialSuperEffective > 0,
    isBalanced:
      offensiveAnalysis.physicalSuperEffective > 0 &&
      offensiveAnalysis.specialSuperEffective > 0,
    stallVulnerability: uncovered > 6,
    wallbreakerPresent:
      offensiveAnalysis.physicalSuperEffective +
        offensiveAnalysis.specialSuperEffective >
      8,
  });
}

function computeTeamStatus(
  team: PokemonTeam,
): import("@/domain/team/types/TeamTypes").TeamCompleteness {
  const size = team.size;
  if (size === 0) return "empty";
  if (size < 6) return "building";
  const members = team.getMembers();
  const hasIncomplete = members.some(
    (m) =>
      m.moves.length < 4 ||
      (Object.values(m.evs) as number[]).reduce((a, b) => a + b, 0) === 0,
  );
  return hasIncomplete ? "incomplete" : "ready";
}

export class AnalyzeTeamUseCase {
  async execute(
    team: PokemonTeam,
    ruleset: BattleRuleset = DEFAULT_BATTLE_RULESET,
  ): Promise<TeamAnalysis> {
    const members = team.getMembers();
    const teamSize = members.length;
    const isEmpty = teamSize === 0;
    const teamStatus = computeTeamStatus(team);

    if (isEmpty) {
      const emptyOff = OffensiveAnalyzer.analyze([], new Map());
      const emptyUtility = UtilityAndSpeedAnalyzer.analyze(team);
      const emptyRole = RoleHeuristics.analyze(team);
      return Object.freeze({
        defensiveCoverage: {} as DefensiveCoverage,
        defensiveReport: Object.freeze({
          coverage: {} as DefensiveCoverage,
          safeSwitchIns: Object.freeze([]),
          criticalWeaknesses: Object.freeze([]),
          mitigatedWeaknesses: Object.freeze([]),
        }),
        offensiveReport: toOffensiveReport(emptyOff),
        utilityReport: emptyUtility,
        roleReport: emptyRole,
        legalityReport: Object.freeze({
          isLegal: true,
          issues: Object.freeze([]),
          format: ruleset.id ?? "singles-6v6",
        }),
        recommendations: Object.freeze([]),
        averageSpeed: 0,
        maxSpeed: 0,
        effectiveMaxSpeed: 0,
        teamSize: 0,
        isLegal: true,
        isEmpty: true,
        teamStatus,
        generatedAt: Date.now(),
        analysisVersion: 2,
      });
    }

    const moveIds = getMoveIds(members);
    const moveMap = await LocalMoveRepository.getByIds(moveIds);
    const metaMapMutable = new Map<string, MoveMeta>();
    for (const [id, dto] of moveMap.entries()) {
      metaMapMutable.set(id.toLowerCase(), toMoveMeta(dto as MoveDTO));
    }
    const metaMap = metaMapMutable as ReadonlyMap<string, MoveMeta>;

    const [
      offensiveAnalysis,
      defensiveData,
      legalityReport,
      utilityReport,
      roleReport,
    ] = await Promise.all([
      Promise.resolve(OffensiveAnalyzer.analyze(members, metaMap)),
      Promise.resolve(computeDefensiveReport(members)),
      Promise.resolve(TeamLegalityValidator.validate(team, ruleset)),
      Promise.resolve(UtilityAndSpeedAnalyzer.analyze(team)),
      Promise.resolve(RoleHeuristics.analyze(team)),
    ]);

    const offensiveReport = toOffensiveReport(offensiveAnalysis);
    const recommendationsMutable: ActionableRecommendation[] = [];

    if (defensiveData.report.criticalWeaknesses.length > 0) {
      for (const weakType of defensiveData.report.criticalWeaknesses) {
        const cov = defensiveData.coverage[weakType];
        recommendationsMutable.push({
          id: `defensive_${weakType}`,
          severity: "Critical",
          category: "defensive_gap",
          issueCode: "massive_weakness",
          problemDescription: `Debilidad defensiva crítica a ${weakType}: ${cov?.weak ?? 0} débiles, solo ${(cov?.resist ?? 0) + (cov?.immune ?? 0)} resistencias`,
          evidence: [`${cov?.weak ?? 0} Pokémon débiles a ${weakType}`],
          actionableAdvice: `Añade un Pokémon que resista o sea inmune a ${weakType}`,
          priorityScore: 90,
          attackingType: weakType,
        } as ActionableRecommendation);
      }
    }

    if (utilityReport.speedControl.conflict) {
      recommendationsMutable.push({
        id: "speed_conflict",
        severity: "High",
        category: "utility",
        issueCode: "trick_room_conflict",
        problemDescription:
          "Conflicto de control de velocidad: Tailwind + Trick Room simultáneos",
        evidence: [...utilityReport.speedControl.controlMethods],
        actionableAdvice:
          "Elige una sola estrategia: Tailwind para rápido o Trick Room para lento",
        priorityScore: 80,
      } as ActionableRecommendation);
    }

    const isSingles6 =
      teamSize === 6 ||
      ruleset.id === "singles-6v6" ||
      ruleset.id === "smogon-ou";
    if (isSingles6) {
      if (!utilityReport.speedControl.isSpeedControlPresent) {
        recommendationsMutable.push({
          id: "speed_control_missing",
          severity: "High",
          category: "utility",
          issueCode: "speed_control_missing",
          problemDescription:
            "Falta control de velocidad en formato singles 6v6",
          evidence: ["Sin Tailwind, Trick Room, Thunder Wave, Choice Scarf"],
          actionableAdvice:
            "Añade Tailwind, Trick Room, Thunder Wave o Choice Scarf",
          priorityScore: 75,
        } as ActionableRecommendation);
      }
      if (!utilityReport.hazardControl.isRemovalPresent) {
        recommendationsMutable.push({
          id: "hazard_removal_missing",
          severity: "Medium",
          category: "utility",
          issueCode: "hazard_removal_missing",
          problemDescription: "Falta remoción de hazards en singles 6v6",
          evidence: ["Sin Defog ni Rapid Spin"],
          actionableAdvice:
            "Añade Defog o Rapid Spin para limpiar Stealth Rock/Spikes",
          priorityScore: 65,
        } as ActionableRecommendation);
      }
    }

    for (const missing of roleReport.missingRoles) {
      recommendationsMutable.push({
        id: `role_${missing}`,
        severity:
          missing === "wall" || missing === "sweeper" ? "High" : "Medium",
        category: "role_balance",
        issueCode: "balance_issue",
        problemDescription: `Falta rol esencial: ${missing}`,
        evidence: [`Rol ${missing} no cubierto`],
        actionableAdvice: `Añade un Pokémon con rol ${missing}`,
        priorityScore: 60,
        targetRole: missing,
      } as unknown as ActionableRecommendation);
    }

    if (offensiveReport.uncoveredTypes.length > 0) {
      recommendationsMutable.push({
        id: "offensive_gap",
        severity: offensiveReport.uncoveredTypes.length > 4 ? "High" : "Medium",
        category: "offensive_gap",
        issueCode: "offensive_coverage_gap",
        problemDescription: `Falta cobertura super eficaz contra: ${offensiveReport.uncoveredTypes.join(", ")}`,
        evidence: offensiveReport.uncoveredTypes.map(
          (t) => `Sin cobertura vs ${t}`,
        ),
        actionableAdvice: "Añade movimientos de tipos faltantes",
        priorityScore: 70,
      } as ActionableRecommendation);
    }

    for (const issue of legalityReport.issues) {
      if (issue.severity === "Info") continue;
      recommendationsMutable.push({
        id: issue.code,
        severity: issue.severity,
        category: "legality",
        issueCode: issue.code,
        problemDescription: issue.message,
        evidence: [...issue.membersInvolved],
        actionableAdvice:
          issue.code === "species_clause"
            ? "Cambia especies duplicadas"
            : issue.code === "item_clause"
              ? "Cambia objetos duplicados (VGC)"
              : "Revisa configuración",
        relatedMemberIds: [...issue.membersInvolved],
        priorityScore: issue.severity === "Critical" ? 100 : 60,
      } as ActionableRecommendation);
    }

    const speeds = members.map((m) => m.calculatedStats.speed ?? 0);
    const averageSpeed = speeds.length
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length
      : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;

    return Object.freeze({
      defensiveCoverage: defensiveData.coverage,
      defensiveReport: defensiveData.report,
      offensiveReport,
      utilityReport,
      roleReport,
      legalityReport,
      recommendations: Object.freeze([...recommendationsMutable]),
      averageSpeed,
      maxSpeed,
      effectiveMaxSpeed: maxSpeed,
      teamSize,
      isLegal: legalityReport.isLegal,
      isEmpty: false,
      teamStatus,
      generatedAt: Date.now(),
      analysisVersion: 2,
    });
  }
}
