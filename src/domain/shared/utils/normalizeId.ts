export function normalizeId(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeAbilityId(input: string | null | undefined): string {
  return normalizeId(input);
}

export function normalizeItemId(input: string | null | undefined): string {
  return normalizeId(input);
}

export function normalizeMoveId(input: string | null | undefined): string {
  return normalizeId(input);
}

export function normalizeSpeciesId(input: string | null | undefined): string {
  return normalizeId(input);
}
