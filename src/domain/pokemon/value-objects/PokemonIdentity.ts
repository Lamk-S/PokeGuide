export type TransformationKind =
  | "mega"
  | "mega-z"
  | "gigantamax"
  | "base"
  | null;
export interface PokemonIdentity {
  speciesId: string;
  formId: string;
  spriteKey: string;
  numericId: number;
  originalName: string;
  isBattleTransformation: boolean;
  transformationKind: TransformationKind;
  debugKey: string;
}
const FORM_SUFFIXES = [
  "-mega-z",
  "-z-mega",
  "-mega",
  "-gmax",
  "-gigantamax",
  "-power-construct",
  "-complete",
  "-10",
  "-50",
];
function extractSpeciesId(name: string): string {
  let n = name.toLowerCase();
  for (const s of FORM_SUFFIXES.sort((a, b) => b.length - a.length)) {
    if (n.endsWith(s)) n = n.slice(0, -s.length);
  }
  n = n
    .replace(
      /-cap.*|-original.*|-hoenn.*|-sinnoh.*|-unova.*|-kalos.*|-alola.*|-partner.*|-starter.*|-world.*/g,
      "",
    )
    .replace(/-$/, "");
  return n || name.toLowerCase();
}
function extractFormId(name: string): string {
  const l = name.toLowerCase();
  if (l.includes("mega-z") || l.includes("z-mega")) return "mega-z";
  if (l.endsWith("-mega")) return "mega";
  if (l.endsWith("-gmax") || l.endsWith("-gigantamax")) return "gmax";
  if (l.endsWith("-complete")) return "complete";
  if (l.endsWith("-10")) return "10";
  if (l.endsWith("-50") || l.includes("50-power-construct")) return "50";
  if (l.includes("power-construct")) return "50-power-construct";
  return "base";
}
function extractTransformationKind(name: string): TransformationKind {
  const l = name.toLowerCase();
  if (l.includes("mega-z") || l.includes("z-mega")) return "mega-z";
  if (l.endsWith("-mega")) return "mega";
  if (l.endsWith("-gmax") || l.endsWith("-gigantamax")) return "gigantamax";
  return null;
}
export function parsePokemonIdentity(pokemon: { id: number; name: string }) {
  const originalName = pokemon.name;
  const speciesId = extractSpeciesId(originalName);
  const formId = extractFormId(originalName);
  const transformationKind = extractTransformationKind(originalName);
  const isBattleTransformation =
    transformationKind === "mega" ||
    transformationKind === "mega-z" ||
    transformationKind === "gigantamax";
  return {
    speciesId,
    formId,
    spriteKey: `${pokemon.id}`,
    numericId: pokemon.id,
    originalName,
    isBattleTransformation,
    transformationKind,
    debugKey: `${speciesId}:${formId}:${pokemon.id}:${originalName}`,
  } as const;
}
export function createIdentityFromNumericId(
  id: number,
  pokemonList: Array<{ id: number; name: string }>,
) {
  const found = pokemonList.find((p) => p.id === id);
  if (!found) return null;
  return parsePokemonIdentity(found);
}
