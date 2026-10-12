import type { TeamMember } from "@/domain/team/types/TeamTypes";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
  readonly formId?: string;
};

const POKEMON_NAME_TO_ID: Readonly<Record<string, number>> = {
  bulbasaur: 1,
  ivysaur: 2,
  venusaur: 3,
  charmander: 4,
  charmeleon: 5,
  charizard: 6,
  squirtle: 7,
  wartortle: 8,
  blastoise: 9,
  pikachu: 25,
  raichu: 26,
  clefable: 36,
  aerodactyl: 142,
  dragonite: 149,
  tyranitar: 248,
  gengar: 94,
  gyarados: 130,
  luxray: 405,
  garchomp: 445,
  rotom: 479,
  "rotom-wash": 479,
  ferrothorn: 598,
  corviknight: 823,
  dragapult: 887,
  gholdengo: 1000,
  heatran: 485,
  toxapex: 748,
  weavile: 461,
  landorus: 645,
} as const;

const FORM_ID_TO_BASE: Readonly<Record<number, number>> = {
  10033: 6,
  10034: 6,
  10129: 6,
  10003: 3,
  10013: 94,
  10130: 94,
};

function normalizeName(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, "-");
}
function sanitizeKey(key: string): string {
  return key.replace(/[^a-z0-9-]/g, "");
}
export function resolveBaseName(name: string): string {
  return normalizeName(name).split("-")[0];
}

export function resolvePokemonNumericId(member: TeamMember): number {
  const meta = member as MemberWithMeta;
  const idStr = meta.formId ?? meta.id ?? "";
  const parsed = Number.parseInt(idStr, 10);
  if (!Number.isNaN(parsed) && parsed >= 10000) {
    if (FORM_ID_TO_BASE[parsed]) return FORM_ID_TO_BASE[parsed];
  }
  if (!Number.isNaN(parsed) && parsed > 0 && parsed < 10000) {
    if (parsed !== 25) return parsed;
    const base = resolveBaseName(meta.name ?? meta.species ?? "");
    if (POKEMON_NAME_TO_ID[base] && POKEMON_NAME_TO_ID[base] !== 25)
      return POKEMON_NAME_TO_ID[base];
    return parsed;
  }
  const rawName = meta.name ?? meta.species ?? "";
  const nameKey = normalizeName(rawName);
  if (POKEMON_NAME_TO_ID[nameKey]) return POKEMON_NAME_TO_ID[nameKey];
  const base = resolveBaseName(nameKey);
  if (POKEMON_NAME_TO_ID[base]) return POKEMON_NAME_TO_ID[base];
  const clean = sanitizeKey(nameKey);
  if (POKEMON_NAME_TO_ID[clean]) return POKEMON_NAME_TO_ID[clean];
  const cleanBase = resolveBaseName(clean);
  if (POKEMON_NAME_TO_ID[cleanBase]) return POKEMON_NAME_TO_ID[cleanBase];
  return 25;
}
export function getPokemonNameToIdMap(): Readonly<Record<string, number>> {
  return POKEMON_NAME_TO_ID;
}
