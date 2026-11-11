import type { PokemonTeam } from "../../entities/PokemonTeam";
import type {
  HazardControlReport,
  SpeedControlReport,
  UtilityReport,
} from "../../types/TeamTypes";

const SPEED_CONTROL_MOVES: Record<
  string,
  | "tailwind"
  | "trick_room"
  | "sticky_web"
  | "thunder_wave"
  | "icy_wind"
  | "priority"
  | "other"
> = {
  tailwind: "tailwind",
  "viento-afin": "tailwind",
  "viento-a-fin": "tailwind",
  "trick-room": "trick_room",
  "espacio-raro": "trick_room",
  "sticky-web": "sticky_web",
  "red-viscosa": "sticky_web",
  "thunder-wave": "thunder_wave",
  "onda-trueno": "thunder_wave",
  glare: "thunder_wave",
  "stun-spore": "thunder_wave",
  "icy-wind": "icy_wind",
  "viento-hielo": "icy_wind",
  electroweb: "icy_wind",
  "string-shot": "other",
  "cotton-spore": "other",
};

const HAZARD_REMOVER_MOVES = new Set([
  "defog",
  "despejar",
  "rapid-spin",
  "giro-rapido",
  "giro-rápido",
  "court-change",
  "cambio-de-pista",
  "mortal-spin",
  "giro-mortal",
  "tidy-up",
  "ordenar",
]);

const PIVOT_MOVES = new Set([
  "u-turn",
  "ida-y-vuelta",
  "volt-switch",
  "voltiocambio",
  "flip-turn",
  "viraje",
  "parting-shot",
  "tiro-por-la-culata",
  "teleport",
  "teletransporte",
  "baton-pass",
  "relevo",
]);

const KNOCK_OFF_MOVES = new Set(["knock-off", "desarme"]);
const TAUNT_MOVES = new Set(["taunt", "mofa", "encore", "otra-vez"]);

function normalize(name: string): string {
  return name.toLowerCase().replace(/_/g, "-").trim();
}

function analyzeSpeedControl(team: PokemonTeam): SpeedControlReport {
  const members = team.getMembers();
  let hasTailwind = false;
  let hasTrickRoom = false;
  let hasStickyWeb = false;
  let hasThunderWave = false;
  let hasIcyWind = false;
  let hasPriority = false;
  let hasChoiceScarf = false;
  let hasBoosterEnergy = false;

  const controlMethods: string[] = [];

  for (const member of members) {
    const itemNorm = normalize(member.itemId ?? member.item ?? "");
    if (
      itemNorm === "choice-scarf" ||
      itemNorm === "pa" ||
      itemNorm.includes("scarf")
    ) {
      hasChoiceScarf = true;
    }
    if (itemNorm === "booster-energy" || itemNorm.includes("booster")) {
      hasBoosterEnergy = true;
    }

    for (const move of member.moves) {
      const n = normalize(move.name);
      const mapped = SPEED_CONTROL_MOVES[n];
      if (mapped === "tailwind") {
        hasTailwind = true;
        if (!controlMethods.includes("Tailwind"))
          controlMethods.push("Tailwind");
      } else if (mapped === "trick_room") {
        hasTrickRoom = true;
        if (!controlMethods.includes("Trick Room"))
          controlMethods.push("Trick Room");
      } else if (mapped === "sticky_web") {
        hasStickyWeb = true;
        if (!controlMethods.includes("Sticky Web"))
          controlMethods.push("Sticky Web");
      } else if (mapped === "thunder_wave") {
        hasThunderWave = true;
        if (!controlMethods.includes("Thunder Wave"))
          controlMethods.push("Thunder Wave");
      } else if (mapped === "icy_wind") {
        hasIcyWind = true;
        if (!controlMethods.includes("Icy Wind"))
          controlMethods.push("Icy Wind");
      }

      if (
        (move.priority && move.priority > 0) ||
        [
          "quick-attack",
          "ataque-rapido",
          "mach-punch",
          "bullet-punch",
          "ice-shard",
          "shadow-sneak",
          "sucker-punch",
          "extremespeed",
          "fake-out",
        ].some((p) => n.includes(p))
      ) {
        hasPriority = true;
        if (!controlMethods.includes("Priority"))
          controlMethods.push("Priority");
      }
    }
  }

  for (const m of members) {
    const id = normalize(m.itemId ?? m.item ?? "");
    if (id === "choice-scarf" || id === "pa" || id.includes("scarf")) {
      hasChoiceScarf = true;
      if (!controlMethods.includes("Choice Scarf"))
        controlMethods.push("Choice Scarf");
    }
    if (id === "booster-energy" || id.includes("booster")) {
      hasBoosterEnergy = true;
      if (!controlMethods.includes("Booster Energy"))
        controlMethods.push("Booster Energy");
    }
  }

  const isSpeedControlPresent =
    controlMethods.length > 0 || hasChoiceScarf || hasBoosterEnergy;
  const conflict = hasTailwind && hasTrickRoom;

  return {
    hasTailwind,
    hasTrickRoom,
    hasStickyWeb,
    hasThunderWave,
    hasIcyWind,
    hasPriority,
    hasChoiceScarf,
    hasBoosterEnergy,
    controlMethods,
    isSpeedControlPresent,
    conflict,
  };
}

function analyzeHazardControl(team: PokemonTeam): HazardControlReport {
  const members = team.getMembers();
  let hasStealthRock = false;
  let hasSpikes = false;
  let hasToxicSpikes = false;
  let hasDefog = false;
  let hasRapidSpin = false;
  let hasCourtChange = false;
  let heavyDutyBoots = 0;
  const setters: string[] = [];
  const removers: string[] = [];

  for (const member of members) {
    const itemNorm = normalize(member.itemId ?? member.item ?? "");
    if (
      itemNorm === "heavy-duty-boots" ||
      itemNorm === "botas-gruesas" ||
      itemNorm.includes("heavy-duty-boots")
    ) {
      heavyDutyBoots += 1;
    }

    for (const move of member.moves) {
      const n = normalize(move.name);
      if (n === "stealth-rock" || n === "trampa-rocas") {
        hasStealthRock = true;
        if (!setters.includes(member.id)) setters.push(member.id);
      }
      if (n === "spikes" || n === "puas" || n === "púas") {
        hasSpikes = true;
        if (!setters.includes(member.id)) setters.push(member.id);
      }
      if (
        n === "toxic-spikes" ||
        n === "puas-toxicas" ||
        n === "púas-tóxicas"
      ) {
        hasToxicSpikes = true;
        if (!setters.includes(member.id)) setters.push(member.id);
      }
      if (HAZARD_REMOVER_MOVES.has(n)) {
        if (n.includes("defog") || n.includes("despejar")) hasDefog = true;
        if (n.includes("rapid-spin") || n.includes("giro")) hasRapidSpin = true;
        if (n.includes("court-change")) hasCourtChange = true;
        if (!removers.includes(member.id)) removers.push(member.id);
      }
    }
  }

  const isHazardControlPresent = hasStealthRock || hasSpikes || hasToxicSpikes;
  const isRemovalPresent = hasDefog || hasRapidSpin || hasCourtChange;

  return {
    hasStealthRock,
    hasSpikes,
    hasToxicSpikes,
    hasDefog,
    hasRapidSpin,
    hasCourtChange,
    hasHeavyDutyBoots: heavyDutyBoots,
    setters,
    removers,
    isHazardControlPresent,
    isRemovalPresent,
  };
}

function analyzeUtility(team: PokemonTeam): UtilityReport {
  const speedControl = analyzeSpeedControl(team);
  const hazardControl = analyzeHazardControl(team);

  const members = team.getMembers();
  let hasPivot = false;
  const pivotMembers: string[] = [];
  let hasKnockOff = false;
  let hasTaunt = false;

  for (const member of members) {
    for (const move of member.moves) {
      const n = normalize(move.name);
      if (
        PIVOT_MOVES.has(n) ||
        n.includes("u-turn") ||
        n.includes("volt-switch") ||
        n.includes("flip-turn")
      ) {
        hasPivot = true;
        if (!pivotMembers.includes(member.id)) pivotMembers.push(member.id);
      }
      if (KNOCK_OFF_MOVES.has(n)) hasKnockOff = true;
      if (TAUNT_MOVES.has(n)) hasTaunt = true;
    }
  }

  return {
    speedControl,
    hazardControl,
    hasPivot,
    pivotMembers,
    hasKnockOff,
    hasTaunt,
  };
}

export const UtilityAndSpeedAnalyzer = Object.freeze({
  analyzeSpeedControl,
  analyzeHazardControl,
  analyze: analyzeUtility,
});
