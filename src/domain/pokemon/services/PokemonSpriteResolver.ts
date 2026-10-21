import type { ParsedIdentity } from "../value-objects/PokemonIdentity";

export type SpriteResolveOptions = { shiny?: boolean };
export type SpriteResult = string[] & { chain: string[]; primary: string };

const POKEAPI_OA =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function getOfficialArtworkUrl(id: number): string {
  const safeId = Number.isInteger(id) && id > 0 ? id : 25;
  return `${POKEAPI_OA}/${safeId}.png`;
}

function extractIdentity(
  identity: ParsedIdentity | { id: number; name: string },
): { numericId: number; base: string; form: string } {
  if ("base" in identity && "form" in identity) {
    const p = identity as ParsedIdentity;
    return {
      numericId: p.numericId || p.dexId || 0,
      base: p.base.toLowerCase(),
      form: (p.form || "base").toLowerCase(),
    };
  }
  const obj = identity as { id: number; name: string };
  const normalized = obj.name
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const parts = normalized.split("-").filter(Boolean);
  const base = parts[0] ?? normalized;
  const form = parts.length > 1 ? parts.slice(1).join("-") : "base";
  return { numericId: obj.id, base, form };
}

function makeResult(tokens: string[], chain: string[]): SpriteResult {
  const arr = [...tokens, ...chain] as unknown as SpriteResult;
  Object.defineProperty(arr, "chain", {
    value: chain,
    enumerable: true,
    writable: false,
  });
  Object.defineProperty(arr, "primary", {
    value: chain[0],
    enumerable: true,
    writable: false,
  });
  return arr;
}

export class PokemonSpriteResolver {
  resolve(
    identity: ParsedIdentity | { id: number; name: string },
    options?: SpriteResolveOptions,
  ): SpriteResult {
    const { numericId, base, form } = extractIdentity(identity);
    const safeId = numericId || 25;
    const official = getOfficialArtworkUrl(safeId);

    const chain = [
      `${official}#/home/`,
      official,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${safeId}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${safeId}.png`,
    ];

    const normalizedForm = form === "base" ? "" : form;
    const key = normalizedForm ? `${base}-${normalizedForm}` : base;
    const flatForm = normalizedForm.replace(/-/g, "");
    const shinyTag = options?.shiny ? "ani-shiny" : "ani";

    const tokens = [
      base,
      normalizedForm,
      flatForm,
      shinyTag,
      key,
      official,
    ].filter(Boolean) as string[];

    return makeResult(tokens, chain);
  }

  static resolve(
    identity: ParsedIdentity | { id: number; name: string },
    options?: SpriteResolveOptions,
  ): SpriteResult {
    return new PokemonSpriteResolver().resolve(identity, options);
  }
}

export function resolvePokemonSprite(
  identity: ParsedIdentity | { id: number; name: string },
  options?: SpriteResolveOptions,
): SpriteResult {
  return new PokemonSpriteResolver().resolve(identity, options);
}

export function getSpriteChain(
  identity: { id: number; name: string } | ParsedIdentity,
): string[] {
  const { numericId } = extractIdentity(identity as never);
  const safeId = numericId || 25;
  const official = getOfficialArtworkUrl(safeId);
  return [
    `${official}#/home/`,
    official,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${safeId}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${safeId}.png`,
  ];
}

export default PokemonSpriteResolver;
