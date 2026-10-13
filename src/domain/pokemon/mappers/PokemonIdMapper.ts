import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { TeamMember } from "@/domain/team/types/TeamTypes";

export function normalizeName(name: string): string {
  return normalizeId(name);
}

export function getBaseSpeciesId(name: string): string {
  const normalized = normalizeName(name);
  const parts = normalized.split("-");
  const first = parts[0];
  return first ?? normalized;
}

export function resolveBaseName(name: string): string {
  const normalized = normalizeName(name);
  const parts = normalized.split("-");
  const first = parts[0];
  return first ?? normalized;
}

export function toSpeciesId(name: string): string {
  return normalizeName(name);
}

type MemberInput = Pick<TeamMember, "id" | "name"> & {
  species?: string;
  displayNameEs?: string;
  id?: string | number;
  name?: string;
};

export function resolvePokemonNumericId(
  member: MemberInput | null | undefined,
): number {
  if (!member) return 25;
  const rawId = (member as { id?: unknown }).id;
  if (typeof rawId === "number" && Number.isFinite(rawId)) return rawId;
  if (typeof rawId === "string") {
    const parsed = Number.parseInt(rawId, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  const rawName =
    (member as { name?: string }).name ??
    (member as { species?: string }).species ??
    "";
  const maybeNum = rawName.match(/^(\d+)/);
  if (maybeNum?.[1]) {
    const n = Number.parseInt(maybeNum[1], 10);
    if (!Number.isNaN(n)) return n;
  }
  return 25;
}
