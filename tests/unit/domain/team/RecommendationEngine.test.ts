import { describe, it, expect } from "vitest";
import { RecommendationEngine, type PureTeamRecommendation } from "@/domain/team/services/RecommendationEngine";
import type { TypeExposure, ActionableRecommendation } from "@/domain/team/types/TeamTypes";

describe("RecommendationEngine - Dominio Puro y Master Report", () => {
  describe("Legacy Coverage Generation", () => {
    it("detecta vulnerabilidad crítica cuando 3 son débiles y 1 resiste", () => {
      const coverage: Record<string, TypeExposure> = {
        ice: { weak: 3, resist: 1, immune: 0, neutral: 2 },
      };
      const recommendations = RecommendationEngine.generate(coverage) as PureTeamRecommendation[];
      expect(recommendations.length).toBe(1);
      
      const first = recommendations[0];
      if (!first) throw new Error("Se esperaba recomendación");
      
      expect(first.severity).toBe("Critical");
      expect(first.issueCode).toBe("massive_weakness");
      expect(first.category).toBe("defensive_gap");
      expect(first.attackingType).toBe("ice");
    });

    it("detecta punto único de fallo (dependencia)", () => {
      const coverage: Record<string, TypeExposure> = {
        ground: { weak: 2, resist: 1, immune: 0, neutral: 3 },
      };
      const recommendations = RecommendationEngine.generate(coverage) as PureTeamRecommendation[];
      expect(recommendations.length).toBe(1);
      expect(recommendations[0]?.severity).toBe("High");
      expect(recommendations[0]?.issueCode).toBe("single_point_failure");
    });

    it("detecta vulnerabilidad alta cuando 2 son débiles y ninguno resiste", () => {
      const coverage: Record<string, TypeExposure> = {
        fire: { weak: 2, resist: 0, immune: 0, neutral: 4 },
      };
      const recommendations = RecommendationEngine.generate(coverage) as PureTeamRecommendation[];
      expect(recommendations.length).toBe(1);
      expect(recommendations[0]?.severity).toBe("High");
      expect(recommendations[0]?.issueCode).toBe("massive_weakness");
    });
  });

  describe("Edge Cases y Fallbacks", () => {
    it("retorna un array vacío ante inputs no reconocidos", () => {
      expect(RecommendationEngine.generate(null)).toEqual([]);
      expect(RecommendationEngine.generate("string")).toEqual([]);
      expect(RecommendationEngine.generate({ unexpected_format: true })).toEqual([]);
      expect(RecommendationEngine.generate({})).toEqual([]);
    });
  });

  describe("Actionable Master Report Generation", () => {
    const createBaseMasterReport = (): any => ({
      defensive: {
        coverage: { fire: { weak: 1, resist: 2, immune: 0, neutral: 3 } },
        safeSwitchIns: [{ type: "fire", count: 2, members: ["pkmn1", "pkmn2"], isSafe: true }],
        criticalWeaknesses: [],
        mitigatedWeaknesses: []
      },
      offensive: {
        coverage: [],
        uncoveredTypes: [],
        totalCovered: 18,
        coveragePercent: 100,
        physicalMoves: 5,
        specialMoves: 5,
        hasPhysicalAttacker: true,
        hasSpecialAttacker: true,
        isBalanced: true,
        stallVulnerability: false,
        wallbreakerPresent: true
      },
      utility: {
        speedControl: {
          hasTailwind: true,
          hasTrickRoom: false,
          hasStickyWeb: false,
          hasThunderWave: false,
          hasIcyWind: false,
          hasPriority: true,
          hasChoiceScarf: false,
          hasBoosterEnergy: false,
          controlMethods: ["Tailwind", "Priority"],
          isSpeedControlPresent: true,
          conflict: false
        },
        hazardControl: {
          hasStealthRock: true,
          hasSpikes: false,
          hasToxicSpikes: false,
          hasDefog: true,
          hasRapidSpin: false,
          hasCourtChange: false,
          hasHeavyDutyBoots: 2,
          setters: ["pkmn1"],
          removers: ["pkmn2"],
          isHazardControlPresent: true,
          isRemovalPresent: true
        },
        hasPivot: true,
        pivotMembers: ["pkmn1"],
        hasKnockOff: true,
        hasTaunt: true
      },
      roles: {
        assignments: [],
        roleCounts: { sweeper: 1, wallbreaker: 1, tank: 1, wall: 1, pivot: 1, revenge_killer: 1, hazard_setter: 1, hazard_remover: 1, speed_controller: 1, cleric: 0, support: 0, stallbreaker: 0, unclassified: 0 },
        hasBalancedRoles: true,
        missingRoles: [],
        redundantRoles: []
      },
      legality: {
        isLegal: true,
        issues: [],
        format: "OU"
      }
    });

    it("no retorna recomendaciones para un equipo perfectamente balanceado y legal", () => {
      const report = createBaseMasterReport();
      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      expect(recs.length).toBe(0);
    });

    it("genera advertencias de legalidad mapeando todas las severidades", () => {
      const report = createBaseMasterReport();
      report.legality.isLegal = false;
      report.legality.issues = [
        { code: "species_clause", message: "Repetido", membersInvolved: ["1", "2"], severity: "Critical" },
        { code: "item_clause", message: "Objeto repetido", membersInvolved: ["3", "4"], severity: "High" },
        { code: "ev_overflow", message: "EVs excedidos", membersInvolved: ["5"], severity: "Medium" },
        { code: "level_illegal", message: "Nivel inválido", membersInvolved: ["6"], severity: "Low" },
        { code: "ability_illegal", message: "Habilidad bloqueada", membersInvolved: ["7"], severity: "Info" }
      ];

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      expect(recs.length).toBe(5);
      
      const speciesRec = recs.find((r) => r.issueCode === "species_clause");
      expect(speciesRec?.severity).toBe("Critical");
      expect(speciesRec?.priorityScore).toBe(120);

      expect(recs.find((r) => r.issueCode === "item_clause")?.severity).toBe("High");
      expect(recs.find((r) => r.issueCode === "ev_overflow")?.severity).toBe("Medium");
      expect(recs.find((r) => r.issueCode === "level_illegal")?.severity).toBe("Low");
    });

    it("genera alerta por debilidad defensiva crítica basada en habilidades/objetos resueltos", () => {
      const report = createBaseMasterReport();
      report.defensive.criticalWeaknesses = ["water"];
      report.defensive.coverage["water"] = { weak: 3, resist: 0, immune: 0, neutral: 3 };
      
      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      const waterRec = recs.find((r) => r.issueCode === "massive_weakness");
      
      expect(waterRec).toBeDefined();
      expect(waterRec?.severity).toBe("Critical");
      expect(waterRec?.attackingType).toBe("water");
    });

    it("genera alerta por baja cobertura ofensiva", () => {
      const report = createBaseMasterReport();
      report.offensive.uncoveredTypes = ["normal", "fire", "water", "grass", "electric", "ice", "fighting"];
      report.offensive.coveragePercent = 60;

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      const gapRec = recs.find((r) => r.issueCode === "offensive_coverage_gap");
      
      expect(gapRec).toBeDefined();
      expect(gapRec?.severity).toBe("High");
      expect(gapRec?.targetType).toBe("normal");
    });

    it("genera alerta de stall vulnerability", () => {
      const report = createBaseMasterReport();
      report.offensive.stallVulnerability = true;

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      const stallRec = recs.find((r) => r.issueCode === "stall_vulnerability");
      expect(stallRec).toBeDefined();
      expect(stallRec?.severity).toBe("Medium");
    });

    it("genera alertas de control de velocidad y conflictos (Tailwind vs Trick Room)", () => {
      const report = createBaseMasterReport();
      report.utility.speedControl.isSpeedControlPresent = false;
      report.utility.speedControl.conflict = true;

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      expect(recs.find((r) => r.issueCode === "speed_control_missing")).toBeDefined();
      expect(recs.find((r) => r.issueCode === "trick_room_conflict")).toBeDefined();
    });

    it("genera alertas por falta de control de hazards y pivotes", () => {
      const report = createBaseMasterReport();
      report.utility.hazardControl.isHazardControlPresent = false;
      report.utility.hazardControl.isRemovalPresent = false;
      report.utility.hazardControl.hasHeavyDutyBoots = 1;
      report.utility.hasPivot = false;

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      expect(recs.find((r) => r.issueCode === "hazard_control_missing")).toBeDefined();
      expect(recs.find((r) => r.issueCode === "hazard_removal_missing")).toBeDefined();
      expect(recs.find((r) => r.issueCode === "pivot_missing")).toBeDefined();
    });

    it("genera alertas por roles faltantes y redundantes en el equipo", () => {
      const report = createBaseMasterReport();
      report.roles.hasBalancedRoles = false;
      report.roles.missingRoles = ["wall", "sweeper", "speed_controller", "hazard_setter", "pivot"];
      report.roles.redundantRoles = ["wallbreaker"];
      report.roles.roleCounts["wallbreaker"] = 4;

      const recs = RecommendationEngine.generate(report) as ActionableRecommendation[];
      
      const balanceIssues = recs.filter((r) => r.issueCode === "balance_issue");
      expect(balanceIssues.length).toBe(4);
      
      const redundantIssue = recs.find((r) => r.issueCode === "redundant_roles");
      expect(redundantIssue).toBeDefined();
      expect(redundantIssue?.severity).toBe("Low");
    });
  });
});