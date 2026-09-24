import type { PokemonIdentity } from "../value-objects/PokemonIdentity";

export interface MoveOverride {
  inheritMovesFrom?: string | null;
  add?: string[];
  remove?: string[];
  replace?: Record<string, string>;
}

export interface ResolvedMoves {
  moves: string[];
  source: "direct" | "inherited" | "override" | "fallback";
  inheritedFrom?: string;
  warnings?: string[];
}

interface PokemonWithMoves {
  name: string;
  moves?: Array<string | { name: string }>;
}

export const DEFAULT_OVERRIDES: Record<string, MoveOverride> = {
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
};

function extractMoveName(move: string | { name: string }): string {
  return typeof move === "string" ? move : move.name;
}

function normalize(name: string): string {
  return name.toLowerCase().trim();
}

function findPokemonByName(
  pokemonList: Array<PokemonWithMoves>,
  targetName: string,
): PokemonWithMoves | undefined {
  const lower = normalize(targetName);
  return (
    pokemonList.find((p) => normalize(p.name) === lower) ||
    pokemonList.find((p) => normalize(p.name).startsWith(`${lower}-`)) ||
    pokemonList.find((p) => normalize(p.name).includes(lower))
  );
}

function findBestBaseWithMoves(
  candidates: Array<PokemonWithMoves>,
): PokemonWithMoves | undefined {
  return candidates
    .filter((p) => (p.moves?.length || 0) > 5)
    .sort((a, b) => (b.moves?.length || 0) - (a.moves?.length || 0))[0];
}

function applyOverrideTransforms(
  moves: string[],
  override?: MoveOverride,
): string[] {
  let result = [...moves];
  if (!override) return result;

  if (override.remove) {
    const removeSet = new Set(override.remove.map(normalize));
    result = result.filter((m) => !removeSet.has(normalize(m)));
  }
  if (override.add) {
    result = [...new Set([...result, ...override.add])];
  }
  if (override.replace) {
    const replaceMap = Object.fromEntries(
      Object.entries(override.replace).map(([k, v]) => [normalize(k), v]),
    );
    result = result.map((m) => replaceMap[normalize(m)] ?? m);
  }
  return result;
}

export function resolvePokemonMovesSync(
  identity: PokemonIdentity,
  pokemonList: Array<PokemonWithMoves>,
  overrides: Record<string, MoveOverride> = DEFAULT_OVERRIDES,
): ResolvedMoves {
  const originalName = normalize(identity.originalName);
  const speciesId = normalize(identity.speciesId);

  let override: MoveOverride | undefined =
    overrides[originalName] || overrides[`${speciesId}-${identity.formId}`];

  if (!override) {
    if (
      identity.transformationKind === "mega" ||
      identity.transformationKind === "mega-z"
    ) {
      override = { inheritMovesFrom: speciesId };
    } else if (identity.transformationKind === "gigantamax") {
      override = { inheritMovesFrom: speciesId };
    } else if (identity.formId !== "base" && identity.formId !== "50") {
      const directCheck = findPokemonByName(pokemonList, originalName);
      if (!directCheck?.moves || directCheck.moves.length <= 5) {
        override = { inheritMovesFrom: speciesId };
      }
    }
  }

  const direct = findPokemonByName(pokemonList, originalName);

  if (direct?.moves && direct.moves.length > 5 && !override?.inheritMovesFrom) {
    return { moves: direct.moves.map(extractMoveName), source: "direct" };
  }

  const inheritFrom = normalize(override?.inheritMovesFrom ?? speciesId);

  const baseCandidates = pokemonList.filter((p) => {
    const lower = normalize(p.name);
    return (
      lower === inheritFrom ||
      lower === `${inheritFrom}-base` ||
      lower === `${inheritFrom}-50` ||
      lower.startsWith(`${inheritFrom}-`) ||
      lower === speciesId ||
      lower.startsWith(`${speciesId}-`)
    );
  });

  const baseWithMoves = findBestBaseWithMoves(baseCandidates);

  if (baseWithMoves?.moves) {
    const transformed = applyOverrideTransforms(
      baseWithMoves.moves.map(extractMoveName),
      override,
    );

    if (override) {
      return {
        moves: transformed,
        source: "override",
        inheritedFrom: baseWithMoves.name,
        warnings: [
          `Heredados de ${baseWithMoves.name} (${transformed.length} movs)`,
        ],
      };
    }
    return {
      moves: transformed,
      source: "inherited",
      inheritedFrom: baseWithMoves.name,
    };
  }

  if (direct?.moves && direct.moves.length > 0) {
    return {
      moves: direct.moves.map(extractMoveName),
      source: "direct",
      warnings: ["Movepool incompleto - forma sin herencia"],
    };
  }

  const anyFromSpecies = pokemonList
    .filter(
      (p) =>
        normalize(p.name).includes(speciesId) && (p.moves?.length || 0) > 5,
    )
    .sort((a, b) => (b.moves?.length || 0) - (a.moves?.length || 0))[0];

  if (anyFromSpecies?.moves) {
    return {
      moves: anyFromSpecies.moves.map(extractMoveName),
      source: "fallback",
      inheritedFrom: anyFromSpecies.name,
      warnings: [`Fallback a ${anyFromSpecies.name}`],
    };
  }

  return {
    moves: [],
    source: "fallback",
    warnings: [`Sin movimientos para ${originalName} - necesita override`],
  };
}

export function isMoveLegalForIdentity(
  moveName: string,
  identity: PokemonIdentity,
  pokemonList: Array<PokemonWithMoves>,
  overrides: Record<string, MoveOverride> = DEFAULT_OVERRIDES,
): boolean {
  const resolved = resolvePokemonMovesSync(identity, pokemonList, overrides);
  return resolved.moves.some((m) => normalize(m) === normalize(moveName));
}
