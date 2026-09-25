export type StatValue = number | { value: number };

export function getStatNumber(v: StatValue | undefined): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v) {
    return (v as { value: number }).value;
  }
  return 0;
}

export type PokemonTypeRef =
  | string
  | { type?: { name?: string }; name?: string };

export function extractTypeName(t: PokemonTypeRef): string {
  if (typeof t === "string") return t;
  return t.type?.name || t.name || "";
}
