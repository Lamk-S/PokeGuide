import { normalizeId } from "@/domain/shared/utils/normalizeId";
import { NATURES } from "@/domain/stats/constants/natures";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";

export interface ShowdownPokemonRaw {
  name: string;
  item?: string | null;
  ability?: string | null;
  level?: number;
  nature?: string | null;
  evs?: Partial<Record<string, number>>;
  ivs?: Partial<Record<string, number>>;
  moves: string[];
}

const STAT_MAP: Record<string, string> = {
  HP: "hp",
  Atk: "attack",
  Def: "defense",
  SpA: "special-attack",
  SpD: "special-defense",
  Spe: "speed",
  PS: "hp",
  ATQ: "attack",
  VEL: "speed",
};

function parseEVsLine(line: string): Partial<Record<string, number>> {
  const evs: Partial<Record<string, number>> = {};
  const content = line.replace(/^EVs:\s*/i, "");
  const parts = content
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    const match = part.match(/(\d+)\s+(\w+)/);
    if (!match) continue;
    const valueStr = match[1];
    const statEs = match[2];
    if (!valueStr || !statEs) continue;
    const value = Number.parseInt(valueStr, 10);
    if (Number.isNaN(value)) continue;
    const key = STAT_MAP[statEs] ?? statEs.toLowerCase();
    evs[key] = value;
  }
  return evs;
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

    const firstLine = lines[0];
    if (!firstLine) continue;

    const splitAt = firstLine.split("@");
    const namePart = splitAt[0]?.trim();
    if (!namePart) continue;
    const itemPart = splitAt[1]?.trim();

    const raw: ShowdownPokemonRaw = {
      name: namePart,
      item: itemPart ? normalizeId(itemPart) : null,
      moves: [],
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      if (/^Ability:/i.test(line)) {
        raw.ability = normalizeId(line.replace(/^Ability:\s*/i, ""));
      } else if (/^Level:/i.test(line)) {
        const lvl = Number.parseInt(line.replace(/^Level:\s*/i, ""), 10);
        if (!Number.isNaN(lvl)) raw.level = lvl;
      } else if (/^EVs:/i.test(line)) {
        raw.evs = parseEVsLine(line);
      } else if (/Nature$/i.test(line)) {
        const natureName = line.replace(/ Nature$/i, "").trim();
        raw.nature =
          NATURES.find((n) => n.name.toLowerCase() === natureName.toLowerCase())
            ?.name ?? natureName;
      } else if (line.startsWith("-")) {
        const moveName = line.replace(/^-+\s*/, "").trim();
        if (moveName) raw.moves.push(normalizeId(moveName));
      }
    }

    if (!raw.level) raw.level = DEFAULT_BATTLE_RULESET.level;
    if (!raw.evs)
      raw.evs = {
        hp: 0,
        attack: 0,
        defense: 0,
        "special-attack": 0,
        "special-defense": 0,
        speed: 0,
      };

    team.push(raw);
  }

  return team;
}

export function serializeToShowdown(
  members: readonly {
    id: string;
    name: string;
    displayNameEs?: string;
    itemId?: string | null;
    item?: string | null;
    abilityId?: string | null;
    ability?: string | null;
    level: number;
    evs: Record<string, number>;
    nature: { name: string };
    moves: readonly string[];
  }[],
): string {
  return members
    .map((m) => {
      const lines: string[] = [];
      const item = m.itemId ?? m.item;
      lines.push(
        item
          ? `${m.displayNameEs ?? m.name} @ ${item}`
          : `${m.displayNameEs ?? m.name}`,
      );
      const ability = m.abilityId ?? m.ability;
      if (ability) lines.push(`Ability: ${ability}`);
      lines.push(`Level: ${m.level}`);
      const evEntries = Object.entries(m.evs)
        .filter(([, v]) => (v as number) > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(" / ");
      if (evEntries) lines.push(`EVs: ${evEntries}`);
      if (m.nature) lines.push(`${m.nature.name} Nature`);
      for (const move of m.moves ?? []) {
        lines.push(`- ${move}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}
