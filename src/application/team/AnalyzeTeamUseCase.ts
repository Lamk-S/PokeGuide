import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { BattleRuleset } from "@/domain/team/config/battleFormat";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import {
  type MoveMeta,
  OffensiveAnalyzer,
} from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import { TeamLegalityValidator } from "@/domain/team/services/TeamLegalityValidator";
import type {
  ActionableRecommendation,
  DefensiveCoverage,
  DefensiveReport,
  OffensiveCoverage,
  OffensiveReport,
  RoleReport,
  SafeSwitchIns,
  TeamAnalysis,
  TeamCompleteness,
  TeamMember,
  UtilityReport,
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
  const safeSwitchInsMutable: SafeSwitchIns[] = [];
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

  const totalCovered = coverageListMutable.filter((c) => c.isCovered).length;
  const uncovered = coverageListMutable.filter((c) => !c.isCovered).length;

  return Object.freeze({
    coverage: Object.freeze([...coverageListMutable]),
    uncoveredTypes: offensiveAnalysis.uncoveredDefenderTypes,
    totalCovered,
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

function computeUtilityReport(): UtilityReport {
  return Object.freeze({
    speedControl: Object.freeze({
      hasTailwind: false,
      hasTrickRoom: false,
      hasStickyWeb: false,
      hasThunderWave: false,
      hasIcyWind: false,
      hasPriority: false,
      hasChoiceScarf: false,
      hasBoosterEnergy: false,
      controlMethods: Object.freeze([]),
      isSpeedControlPresent: false,
      conflict: false,
    }),
    hazardControl: Object.freeze({
      hasStealthRock: false,
      hasSpikes: false,
      hasToxicSpikes: false,
      hasDefog: false,
      hasRapidSpin: false,
      hasCourtChange: false,
      hasHeavyDutyBoots: 0,
      setters: Object.freeze([]),
      removers: Object.freeze([]),
      isHazardControlPresent: false,
      isRemovalPresent: false,
    }),
    hasPivot: false,
    pivotMembers: Object.freeze([]),
    hasKnockOff: false,
    hasTaunt: false,
  });
}

function computeRoleReport(): RoleReport {
  return Object.freeze({
    assignments: Object.freeze([]),
    roleCounts: {} as RoleReport["roleCounts"],
    hasBalancedRoles: false,
    missingRoles: Object.freeze([]),
    redundantRoles: Object.freeze([]),
  });
}

function computeTeamStatus(team: PokemonTeam): TeamCompleteness {
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
      return Object.freeze({
        defensiveCoverage: {} as DefensiveCoverage,
        defensiveReport: Object.freeze({
          coverage: {} as DefensiveCoverage,
          safeSwitchIns: Object.freeze([]),
          criticalWeaknesses: Object.freeze([]),
          mitigatedWeaknesses: Object.freeze([]),
        }),
        offensiveReport: toOffensiveReport(emptyOff),
        utilityReport: computeUtilityReport(),
        roleReport: computeRoleReport(),
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

    const [offensiveAnalysis, defensiveData, legalityReport] =
      await Promise.all([
        Promise.resolve(OffensiveAnalyzer.analyze(members, metaMap)),
        Promise.resolve(computeDefensiveReport(members)),
        Promise.resolve(TeamLegalityValidator.validate(team, ruleset)),
      ]);

    const offensiveReport = toOffensiveReport(offensiveAnalysis);
    const recommendationsMutable: ActionableRecommendation[] = [];

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
        actionableAdvice:
          "Añade movimientos de tipos faltantes con categoría física/especial",
        priorityScore: 70,
      });
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
      });
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
      utilityReport: computeUtilityReport(),
      roleReport: computeRoleReport(),
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
