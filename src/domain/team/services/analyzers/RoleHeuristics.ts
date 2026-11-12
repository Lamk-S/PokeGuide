import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { PokemonTeam } from "../../entities/PokemonTeam";
import type {
  CompetitiveRole,
  RoleAssignment,
  RoleReport,
  TeamMember,
} from "../../types/TeamTypes";

function normalize(name: string): string {
  return normalizeId(name);
}

function classifyMember(member: TeamMember): RoleAssignment {
  const roles: CompetitiveRole[] = [];
  const reasoning: string[] = [];

  const stats = member.calculatedStats;
  const base = member.baseStats;
  const moves = member.moves.map((m) => normalize(m.name));
  const item = normalize(member.itemId ?? member.item ?? "");
  const ability = normalize(member.abilityId ?? member.ability ?? "");

  const totalOffense = stats.attack + stats.specialAttack;
  const isFast = stats.speed >= 100;
  const isVeryFast = stats.speed >= 120;
  const isBulky = stats.hp + stats.defense + stats.specialDefense >= 300;

  const isChoice = item.includes("choice-");
  const isScarf = item === "choice-scarf";
  const isBand = item === "choice-band";
  const isSpecs = item === "choice-specs";
  const isBoots = item.includes("heavy-duty-boots") || item.includes("botas");
  const isLeftovers =
    item.includes("leftovers") ||
    item.includes("restos") ||
    item.includes("black-sludge");
  const isRockyHelmet = item.includes("rocky-helmet");

  const highAtkBase = (base.attack ?? 0) > 120 || stats.attack >= 150;
  const highSpaBase =
    (base["special-attack"] ?? 0) > 120 || stats.specialAttack >= 150;

  if (isBand && highAtkBase) {
    if (isFast || isVeryFast) {
      roles.push("sweeper");
      reasoning.push(
        `Choice Band + ATQ alto ${base.attack}/${stats.attack} + veloz ${stats.speed} -> sweeper inmediato`,
      );
    } else {
      roles.push("wallbreaker");
      reasoning.push(
        `Choice Band + ATQ alto ${base.attack}/${stats.attack} -> wallbreaker inmediato sin setup`,
      );
    }
  }

  if (isSpecs && highSpaBase) {
    if (isFast || isVeryFast) {
      roles.push("sweeper");
      reasoning.push(
        `Choice Specs + AtEsp alto ${base["special-attack"]}/${stats.specialAttack} + veloz -> sweeper especial`,
      );
    } else {
      roles.push("wallbreaker");
      reasoning.push(
        `Choice Specs + AtEsp alto ${base["special-attack"]}/${stats.specialAttack} -> wallbreaker especial inmediato`,
      );
    }
  }

  const hasSetup = moves.some((m) =>
    [
      "swords-dance",
      "danza-espada",
      "dragon-dance",
      "danza-dragon",
      "calm-mind",
      "paz-mental",
      "nasty-plot",
      "maquinacion",
      "shell-smash",
      "rompecoraza",
      "quiver-dance",
      "danza-pluma",
    ].includes(m),
  );
  const hasRecovery = moves.some((m) =>
    [
      "recover",
      "recuperacion",
      "roost",
      "respiro",
      "slack-off",
      "soft-boiled",
      "synthesis",
      "moonlight",
      "wish",
      "deseo",
    ].includes(m),
  );
  const hasHazard = moves.some((m) =>
    [
      "stealth-rock",
      "trampa-rocas",
      "spikes",
      "puas",
      "toxic-spikes",
      "sticky-web",
      "red-viscosa",
    ].includes(m),
  );
  const hasRemoval = moves.some((m) =>
    ["defog", "despejar", "rapid-spin", "giro-rapido", "court-change"].includes(
      m,
    ),
  );
  const hasPivot = moves.some((m) =>
    [
      "u-turn",
      "ida-y-vuelta",
      "volt-switch",
      "voltiocambio",
      "flip-turn",
      "viraje",
      "parting-shot",
    ].includes(m),
  );
  const hasPriority = member.moves.some(
    (m) =>
      (m.priority && m.priority > 0) ||
      [
        "quick-attack",
        "mach-punch",
        "bullet-punch",
        "ice-shard",
        "sucker-punch",
        "extremespeed",
      ].includes(normalize(m.name)),
  );
  const hasStatus = moves.some((m) =>
    [
      "thunder-wave",
      "will-o-wisp",
      "fuego-fatuo",
      "toxic",
      "toxico",
      "sleep-powder",
    ].includes(m),
  );

  if (hasSetup && (isFast || totalOffense > 250)) {
    if (!roles.includes("sweeper")) {
      roles.push("sweeper");
      reasoning.push(`Setup + ofensiva alta (${totalOffense})`);
    }
  }

  if (!hasSetup && totalOffense > 280 && !isBulky) {
    if (!roles.includes("wallbreaker")) {
      roles.push("wallbreaker");
      reasoning.push("Alta ofensiva inmediata sin setup");
    }
  }

  if (isBulky && hasRecovery) {
    roles.push("tank");
    roles.push("wall");
    reasoning.push(
      `Bulky (${stats.hp}/${stats.defense}/${stats.specialDefense}) + recuperación`,
    );
  } else if (isBulky) {
    roles.push("wall");
    reasoning.push("Bulky defensivo");
  }

  if (hasPivot) {
    roles.push("pivot");
    reasoning.push("Movimiento pivote detectado");
  }

  if (isScarf || (isChoice && isFast) || hasPriority) {
    if (!roles.includes("revenge_killer")) {
      roles.push("revenge_killer");
      reasoning.push(
        `Revenge killer: ${isScarf ? "Choice Scarf" : hasPriority ? "prioridad" : "Choice + veloz"}`,
      );
    }
  }

  if (hasHazard) {
    roles.push("hazard_setter");
    reasoning.push("Coloca hazards");
  }

  if (hasRemoval) {
    roles.push("hazard_remover");
    reasoning.push("Remueve hazards");
  }

  if (
    moves.includes("tailwind") ||
    moves.includes("viento-afin") ||
    moves.includes("trick-room") ||
    moves.includes("espacio-raro")
  ) {
    roles.push("speed_controller");
    reasoning.push("Control de velocidad");
  }

  if (
    moves.includes("heal-bell") ||
    moves.includes("aromatherapy") ||
    ability.includes("natural-cure")
  ) {
    roles.push("cleric");
    reasoning.push("Cleric / curación de estado");
  }

  if (hasStatus || isLeftovers || isRockyHelmet || isBoots || isVeryFast) {
    if (!roles.includes("support") && !roles.includes("wall")) {
      roles.push("support");
      reasoning.push("Soporte con estado / objeto defensivo");
    }
  }

  if (
    moves.includes("taunt") ||
    moves.includes("mofa") ||
    moves.includes("knock-off") ||
    moves.includes("desarme")
  ) {
    roles.push("stallbreaker");
    reasoning.push("Rompe stall: Taunt/Knock");
  }

  if (member.isTeraActive && member.teraType) {
    reasoning.push(
      `Tera ${member.teraType} activo: modifica resistencias y STAB`,
    );
  }

  if (roles.length === 0) {
    roles.push("unclassified");
    reasoning.push("No se detectó rol claro, revisar set");
  }

  const primaryRole = roles[0] as CompetitiveRole;

  return {
    memberId: member.id,
    roles: [...new Set(roles)],
    primaryRole,
    reasoning,
  };
}

function analyzeRoles(team: PokemonTeam): RoleReport {
  const members = team.getMembers();
  const assignments = members.map(classifyMember);

  const roleCounts = {} as Record<CompetitiveRole, number>;
  const allRoles: CompetitiveRole[] = [
    "sweeper",
    "wallbreaker",
    "tank",
    "wall",
    "pivot",
    "revenge_killer",
    "hazard_setter",
    "hazard_remover",
    "speed_controller",
    "cleric",
    "support",
    "stallbreaker",
    "unclassified",
  ];
  for (const r of allRoles) roleCounts[r] = 0;

  for (const a of assignments) {
    for (const role of a.roles) {
      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
    }
  }

  const missingRoles: CompetitiveRole[] = [];
  if (roleCounts.hazard_setter === 0) missingRoles.push("hazard_setter");
  if (roleCounts.hazard_remover === 0) missingRoles.push("hazard_remover");
  if (roleCounts.speed_controller === 0 && roleCounts.revenge_killer === 0)
    missingRoles.push("speed_controller");
  if (roleCounts.wall === 0 && roleCounts.tank === 0) missingRoles.push("wall");
  if (roleCounts.sweeper === 0 && roleCounts.wallbreaker === 0)
    missingRoles.push("sweeper");
  if (roleCounts.pivot === 0) missingRoles.push("pivot");

  const redundantRoles: CompetitiveRole[] = [];
  for (const [role, count] of Object.entries(roleCounts)) {
    if (count >= 3 && role !== "unclassified") {
      redundantRoles.push(role as CompetitiveRole);
    }
  }

  const hasBalancedRoles =
    missingRoles.length <= 2 && redundantRoles.length === 0;

  return {
    assignments,
    roleCounts,
    hasBalancedRoles,
    missingRoles,
    redundantRoles,
  };
}

export const RoleHeuristics = Object.freeze({
  classifyMember,
  analyze: analyzeRoles,
});
