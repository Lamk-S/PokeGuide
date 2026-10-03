import type { TeamMember } from "@/domain/team/types/TeamTypes";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
};

const POKEMON_NAME_TO_ID: Readonly<Record<string, number>> = {
  aerodactyl: 142,
  luxray: 405,
  venusaur: 3,
  gyarados: 130,
  dragonite: 149,
  gengar: 94,
  clefable: 36,
  corviknight: 823,
  garchomp: 445,
  ferrothorn: 598,
  dragapult: 887,
  heatran: 485,
  toxapex: 748,
  weavile: 461,
  "rotom-wash": 479,
  rotom: 479,
  tyranitar: 248,
  gholdengo: 1000,
  landorus: 645,
} as const;

function normalizeName(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, "-");
}

function sanitizeKey(key: string): string {
  return key.replace(/[^a-z0-9-]/g, "");
}

export function resolvePokemonNumericId(member: TeamMember): number {
  const meta = member as MemberWithMeta;
  const idStr = meta.id ?? "";
  const parsed = Number.parseInt(idStr, 10);
  if (!Number.isNaN(parsed) && parsed > 0 && parsed < 10000) {
    return parsed;
  }

  const rawName = meta.name ?? meta.species ?? "";
  const nameKey = normalizeName(rawName);
  if (POKEMON_NAME_TO_ID[nameKey]) {
    return POKEMON_NAME_TO_ID[nameKey];
  }

  const clean = sanitizeKey(nameKey);
  if (POKEMON_NAME_TO_ID[clean]) {
    return POKEMON_NAME_TO_ID[clean];
  }

  return 25;
}

export function getPokemonNameToIdMap(): Readonly<Record<string, number>> {
  return POKEMON_NAME_TO_ID;
}
