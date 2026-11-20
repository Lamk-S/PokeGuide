import type { PokemonIdentity } from "../value-objects/PokemonIdentity";

export interface MoveOverride {
  readonly inheritMovesFrom?: string | null;
  readonly add?: readonly string[];
  readonly remove?: readonly string[];
  readonly replace?: Readonly<Record<string, string>>;
}

export interface ResolvedMoves {
  readonly moves: readonly string[];
  readonly source: "direct" | "inherited" | "override" | "fallback";
  readonly inheritedFrom?: string;
  readonly warnings?: readonly string[];
}

type MoveEntry =
  | string
  | { readonly name?: string }
  | { readonly id?: string }
  | { readonly value?: string }
  | {
      readonly move?: string | { readonly name?: string; readonly id?: string };
    }
  | null
  | undefined;

interface PokemonWithMoves {
  readonly name: string;
  readonly moves?: readonly MoveEntry[] | Record<string, MoveEntry> | unknown;
  readonly learnset?:
    | readonly MoveEntry[]
    | Record<string, MoveEntry>
    | unknown;
}

export const DEFAULT_OVERRIDES: Readonly<Record<string, MoveOverride>> =
  Object.freeze({
    "absol-mega-z": { inheritMovesFrom: "absol" },
    "absol-mega": { inheritMovesFrom: "absol" },
    "absol-mega-y": { inheritMovesFrom: "absol" },
    "zygarde-mega": { inheritMovesFrom: "zygarde-50" },
    "zygarde-10": { inheritMovesFrom: "zygarde-50" },
    "zygarde-complete": { inheritMovesFrom: "zygarde-50" },
    "zygarde-50-power-construct": { inheritMovesFrom: "zygarde-50" },
    "charizard-gmax": { inheritMovesFrom: "charizard" },
    "charizard-gigantamax": { inheritMovesFrom: "charizard" },
    "pikachu-gmax": { inheritMovesFrom: "pikachu" },
    "pikachu-gigantamax": { inheritMovesFrom: "pikachu" },
    "garchomp-mega-z": { inheritMovesFrom: "garchomp" },
    "garchomp-mega": { inheritMovesFrom: "garchomp" },
    "lucario-mega-z": { inheritMovesFrom: "lucario" },
    "lucario-mega": { inheritMovesFrom: "lucario" },
    "staraptor-mega": { inheritMovesFrom: "staraptor" },
    "heatran-mega": { inheritMovesFrom: "heatran" },
    "darkrai-mega": { inheritMovesFrom: "darkrai" },
    "urshifu-single-strike-gmax": { inheritMovesFrom: "urshifu-single-strike" },
    "urshifu-single-strike-gigantamax": {
      inheritMovesFrom: "urshifu-single-strike",
    },
    "urshifu-rapid-strike-gmax": { inheritMovesFrom: "urshifu-rapid-strike" },
    "urshifu-rapid-strike-gigantamax": {
      inheritMovesFrom: "urshifu-rapid-strike",
    },
    "palafin-zero": { inheritMovesFrom: "palafin" },
    "palafin-hero": { inheritMovesFrom: "palafin" },
    "palafin-zero-base": { inheritMovesFrom: "palafin" },
  });

function extractMoveName(move: unknown): string {
  if (!move) return "";
  if (typeof move === "string") return move.trim();
  if (typeof move === "object") {
    const o = move as Record<string, unknown>;
    if (typeof o.name === "string" && o.name.trim()) return o.name.trim();
    if (typeof o.id === "string" && o.id.trim()) return o.id.trim();
    if (typeof o.value === "string" && o.value.trim()) return o.value.trim();
    if (typeof o.move === "string" && (o.move as string).trim()) {
      return (o.move as string).trim();
    }
    const inner = o.move as Record<string, unknown> | undefined;
    if (inner) {
      if (typeof inner.name === "string" && inner.name.trim())
        return inner.name.trim();
      if (typeof inner.id === "string" && inner.id.trim())
        return inner.id.trim();
    }
  }
  return "";
}

function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/_/g, "-");
}

function toArraySafe(raw: unknown): unknown[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "object")
    return Object.values(raw as Record<string, unknown>);
  return [];
}

function normalizePokemonList(list: unknown): PokemonWithMoves[] {
  if (!list) return [];
  if (Array.isArray(list)) return list as PokemonWithMoves[];
  if (typeof list === "object") {
    const vals = Object.values(list as Record<string, unknown>);
    if (
      vals.length > 0 &&
      vals.every((v) => typeof v === "object" && v !== null)
    ) {
      return vals as PokemonWithMoves[];
    }
  }
  return [];
}

function findPokemonByName(
  pokemonList: readonly PokemonWithMoves[],
  targetName: string,
): PokemonWithMoves | undefined {
  const lower = normalize(targetName);
  const exact = pokemonList.find((p) => normalize(p.name) === lower);
  if (exact) return exact;
  const baseOnly = lower.split("-")[0];
  if (baseOnly && baseOnly !== lower) {
    const baseExact = pokemonList.find((p) => normalize(p.name) === baseOnly);
    if (baseExact) return baseExact;
  }
  const starts = pokemonList.find((p) =>
    normalize(p.name).startsWith(`${lower}-`),
  );
  if (starts) return starts;
  return pokemonList.find((p) => normalize(p.name).includes(lower));
}

function findBestBaseWithMoves(
  candidates: readonly PokemonWithMoves[],
): PokemonWithMoves | undefined {
  return [...candidates]
    .filter((p) => toArraySafe(p.moves ?? p.learnset).length > 0)
    .sort(
      (a, b) =>
        toArraySafe(b.moves ?? b.learnset).length -
        toArraySafe(a.moves ?? a.learnset).length,
    )[0];
}

function applyOverrideTransforms(
  moves: readonly string[],
  override?: MoveOverride,
): string[] {
  let result = [...moves];
  if (!override) return result;

  if (override.remove && override.remove.length > 0) {
    const removeSet = new Set(override.remove.map(normalize));
    result = result.filter((m) => !removeSet.has(normalize(m)));
  }
  if (override.add && override.add.length > 0) {
    const seen = new Set(result.map(normalize));
    for (const add of override.add) {
      const n = normalize(add);
      if (!seen.has(n)) {
        seen.add(n);
        result.push(add);
      }
    }
  }
  if (override.replace) {
    const replaceMap = Object.fromEntries(
      Object.entries(override.replace).map(([k, v]) => [normalize(k), v]),
    );
    result = result.map((m) => replaceMap[normalize(m)] ?? m);
  }
  return result;
}

function mapMoves(pokemon: PokemonWithMoves | undefined): string[] {
  if (!pokemon) return [];
  const raw = pokemon.moves ?? pokemon.learnset;
  const arr = toArraySafe(raw);
  return arr
    .map(extractMoveName)
    .filter((s) => s.length > 0)
    .map(normalize);
}

export function resolvePokemonMovesSync(
  identity: PokemonIdentity,
  pokemonListRaw: readonly PokemonWithMoves[] | unknown,
  overrides: Readonly<Record<string, MoveOverride>> = DEFAULT_OVERRIDES,
): ResolvedMoves {
  const pokemonList = normalizePokemonList(pokemonListRaw);
  const originalName = normalize(identity.originalName);
  const speciesId = normalize(identity.speciesId);
  const base = normalize(identity.base);
  const formId = normalize(identity.formId);
  const overrideKeys = [
    originalName,
    speciesId,
    `${base}-${formId}`,
    `${speciesId}-${formId}`,
    base,
  ].filter(Boolean);
  let override: MoveOverride | undefined;
  for (const key of overrideKeys) {
    if (overrides[key]) {
      override = overrides[key];
      break;
    }
  }

  if (!override) {
    if (
      identity.transformationKind === "mega" ||
      identity.transformationKind === "mega-z" ||
      identity.transformationKind === "mega-x" ||
      identity.transformationKind === "mega-y" ||
      identity.transformationKind === "gigantamax" ||
      identity.transformationKind === "gmax"
    ) {
      override = { inheritMovesFrom: base };
    } else if (formId !== "base" && formId !== "50" && formId !== "") {
      const directCheck = findPokemonByName(pokemonList, originalName);
      const count = directCheck
        ? toArraySafe(directCheck.moves ?? directCheck.learnset).length
        : 0;
      if (count <= 5) {
        override = { inheritMovesFrom: base };
      }
    }
  }

  const direct =
    findPokemonByName(pokemonList, originalName) ??
    findPokemonByName(pokemonList, speciesId) ??
    findPokemonByName(pokemonList, base);
  const directMoves = mapMoves(direct);

  if (directMoves.length > 5 && !override?.inheritMovesFrom) {
    return Object.freeze({
      moves: Object.freeze([...new Set(directMoves)]) as readonly string[],
      source: "direct" as const,
    });
  }

  const inheritFrom = normalize(
    override?.inheritMovesFrom ?? base ?? speciesId,
  );

  const baseCandidates = pokemonList.filter((p) => {
    const lower = normalize(p.name);
    return (
      lower === inheritFrom ||
      lower === `${inheritFrom}-base` ||
      lower === `${inheritFrom}-50` ||
      lower.startsWith(`${inheritFrom}-`) ||
      lower === speciesId ||
      lower === base ||
      lower.startsWith(`${base}-`)
    );
  });

  const baseWithMoves = findBestBaseWithMoves(
    baseCandidates.length > 0
      ? baseCandidates
      : pokemonList.filter((p) => normalize(p.name).includes(inheritFrom)),
  );

  if (baseWithMoves) {
    const baseMoves = mapMoves(baseWithMoves);
    if (baseMoves.length > 0) {
      const transformed = applyOverrideTransforms(baseMoves, override);
      if (override) {
        return Object.freeze({
          moves: Object.freeze([...new Set(transformed)]) as readonly string[],
          source: "override" as const,
          inheritedFrom: baseWithMoves.name,
          warnings: Object.freeze([
            `Heredados de ${baseWithMoves.name} (${transformed.length} movs)`,
          ]) as readonly string[],
        });
      }
      return Object.freeze({
        moves: Object.freeze([...new Set(transformed)]) as readonly string[],
        source: "inherited" as const,
        inheritedFrom: baseWithMoves.name,
      });
    }
  }

  if (directMoves.length > 0) {
    return Object.freeze({
      moves: Object.freeze([...new Set(directMoves)]) as readonly string[],
      source: "direct" as const,
      warnings: Object.freeze([
        "Movepool incompleto - forma sin herencia",
      ]) as readonly string[],
    });
  }

  const anyFromSpecies = [...pokemonList]
    .filter(
      (p) =>
        normalize(p.name).includes(base) &&
        toArraySafe(p.moves ?? p.learnset).length > 5,
    )
    .sort(
      (a, b) =>
        toArraySafe(b.moves ?? b.learnset).length -
        toArraySafe(a.moves ?? a.learnset).length,
    )[0];

  if (anyFromSpecies) {
    const fallbackMoves = mapMoves(anyFromSpecies);
    if (fallbackMoves.length > 0) {
      return Object.freeze({
        moves: Object.freeze([...new Set(fallbackMoves)]) as readonly string[],
        source: "fallback" as const,
        inheritedFrom: anyFromSpecies.name,
        warnings: Object.freeze([
          `Fallback a ${anyFromSpecies.name}`,
        ]) as readonly string[],
      });
    }
  }

  return Object.freeze({
    moves: Object.freeze([]) as readonly string[],
    source: "fallback" as const,
    warnings: Object.freeze([
      `Sin movimientos para ${originalName} - necesita override`,
    ]) as readonly string[],
  });
}

export function isMoveLegalForIdentity(
  moveName: string,
  identity: PokemonIdentity,
  pokemonList: readonly PokemonWithMoves[] | unknown,
  overrides: Readonly<Record<string, MoveOverride>> = DEFAULT_OVERRIDES,
): boolean {
  const resolved = resolvePokemonMovesSync(
    identity,
    pokemonList as never,
    overrides,
  );
  return resolved.moves.some((m) => normalize(m) === normalize(moveName));
}

export function resolvePokemonMoves(pokemon: PokemonWithMoves): ResolvedMoves {
  const moves = mapMoves(pokemon);
  return Object.freeze({
    moves: Object.freeze([...new Set(moves)]) as readonly string[],
    source: moves.length > 0 ? ("direct" as const) : ("fallback" as const),
  });
}
