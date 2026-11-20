import { NATURES } from "@/domain/stats/constants/natures";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";

export interface ShowdownPokemonRaw {
  readonly name: string;
  readonly species?: string;
  readonly item?: string;
  readonly ability?: string;
  readonly level?: number;
  readonly evs?: Record<string, number>;
  readonly ivs?: Record<string, number>;
  readonly nature?: string;
  readonly moves: readonly string[];
  readonly teraType?: string;
}

const EV_LINE_REGEX = /EVs:\s*(.+)/i;
const IV_LINE_REGEX = /IVs:\s*(.+)/i;
const NATURE_REGEX = /^\s*(\w+)\s+Nature\s*$/i;
const LEVEL_REGEX = /Level:\s*(\d+)/i;
const ABILITY_REGEX = /Ability:\s*(.+)/i;
const TERA_REGEX = /Tera Type:\s*(.+)/i;

const STAT_TO_SHOWDOWN: Record<string, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

function toTitleCase(slug: string): string {
  return slug
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseEvs(line: string): Record<string, number> {
  const evs: Record<string, number> = {};
  const parts = line.split("/");
  for (const part of parts) {
    const m = part.trim().match(/(\d+)\s+(\w+)/);
    if (!m) continue;
    const value = Number(m[1]);
    const statRaw = m[2]?.toLowerCase() ?? "";
    const key = normalizeStat(statRaw);
    if (key) evs[key] = value;
  }
  return evs;
}

function normalizeStat(raw: string): string | null {
  const s = raw.toLowerCase();
  if (s.startsWith("hp")) return "hp";
  if (s.startsWith("atk") && !s.includes("spa")) return "attack";
  if (s.startsWith("def") && !s.includes("spd") && !s.includes("spa"))
    return "defense";
  if (
    s.includes("spa") ||
    s === "spatk" ||
    s === "sp. atk" ||
    s === "special-attack"
  )
    return "special-attack";
  if (
    s.includes("spd") ||
    s === "spdef" ||
    s === "sp. def" ||
    s === "special-defense"
  )
    return "special-defense";
  if (s.startsWith("spe") || s === "speed") return "speed";
  return null;
}

function isNatureLine(line: string): string | null {
  const m = line.match(NATURE_REGEX);
  if (!m) return null;
  const name = m[1]?.trim() ?? "";
  return NATURES.some((n) => n.name.toLowerCase() === name.toLowerCase())
    ? name
    : null;
}

export function parseShowdownTeam(input: string): ShowdownPokemonRaw[] {
  const blocks = input
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const team: ShowdownPokemonRaw[] = [];
  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    const firstLine = lines[0] ?? "";
    const atSplit = firstLine.split("@");
    const namePart = (atSplit[0] ?? firstLine).trim();
    const itemPart = atSplit[1]?.trim();
    let level: number | undefined;
    let ability: string | undefined;
    let nature: string | undefined;
    let evs: Record<string, number> | undefined;
    let ivs: Record<string, number> | undefined;
    let teraType: string | undefined;
    const moves: string[] = [];
    for (const line of lines.slice(1)) {
      if (LEVEL_REGEX.test(line)) {
        const m = line.match(LEVEL_REGEX);
        if (m) level = Number(m[1]);
        continue;
      }
      if (ABILITY_REGEX.test(line)) {
        const m = line.match(ABILITY_REGEX);
        if (m) ability = m[1]?.trim();
        continue;
      }
      const evMatch = line.match(EV_LINE_REGEX);
      if (evMatch) {
        evs = parseEvs(evMatch[1] ?? "");
        continue;
      }
      const ivMatch = line.match(IV_LINE_REGEX);
      if (ivMatch) {
        ivs = parseEvs(ivMatch[1] ?? "");
        continue;
      }
      const natureFound = isNatureLine(line);
      if (natureFound) {
        nature = natureFound;
        continue;
      }
      const teraMatch = line.match(TERA_REGEX);
      if (teraMatch) {
        teraType = teraMatch[1]?.trim();
        continue;
      }
      if (line.startsWith("-")) {
        const moveName = line.slice(1).trim();
        if (moveName) moves.push(moveName);
      }
    }
    team.push(
      Object.freeze({
        name: namePart,
        species: namePart,
        item: itemPart,
        ability,
        level: level ?? DEFAULT_BATTLE_RULESET.level,
        evs,
        ivs,
        nature,
        moves: Object.freeze([...moves]),
        teraType,
      }),
    );
  }
  return team;
}

export function serializeToShowdown(
  members: readonly {
    readonly name: string;
    readonly displayNameEs?: string;
    readonly englishName?: string;
    readonly item?: string | null;
    readonly itemId?: string | null;
    readonly ability?: string | null;
    readonly abilityId?: string | null;
    readonly level?: number;
    readonly evs?: Record<string, number>;
    readonly nature?: { name: string } | string;
    readonly moves: readonly string[];
    readonly teraType?: string | null;
  }[],
): string {
  return members
    .map((m) => {
      const lines: string[] = [];
      const species = toTitleCase(m.englishName ?? m.name);
      const item = m.item ? toTitleCase(m.item) : null;
      const header = item ? `${species} @ ${item}` : species;
      lines.push(header);
      if (m.ability) lines.push(`Ability: ${toTitleCase(m.ability)}`);
      if (m.level) lines.push(`Level: ${m.level}`);
      if (m.evs) {
        const evStr = Object.entries(m.evs)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${v} ${STAT_TO_SHOWDOWN[k] ?? k}`)
          .join(" / ");
        if (evStr) lines.push(`EVs: ${evStr}`);
      }
      const natureName =
        typeof m.nature === "string" ? m.nature : m.nature?.name;
      if (natureName) lines.push(`${toTitleCase(natureName)} Nature`);
      if (m.teraType) lines.push(`Tera Type: ${toTitleCase(m.teraType)}`);
      for (const move of m.moves) lines.push(`- ${toTitleCase(move)}`);
      return lines.join("\n");
    })
    .join("\n\n");
}
