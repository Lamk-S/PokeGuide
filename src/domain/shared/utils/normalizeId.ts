export function normalizeId(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/--+/g, "-");
}

export function normalizeAbilityId(input: string | null | undefined): string {
  return normalizeId(input);
}

export function normalizeItemId(input: string | null | undefined): string {
  return normalizeId(input);
}
