export interface PokemonIdentity {
  numericId: number;
  originalName: string;
  normalizedName: string;
  speciesId: string;
  formId?: string | undefined;
  baseName: string;
  debugKey: string;
  transformationKind?: string | undefined;
  isBattleTransformation?: boolean | undefined;
}

const FORM_SUFFIXES = [
  "-50-power-construct",
  "-mega-z",
  "-mega-y",
  "-mega-x",
  "-mega",
  "-gmax",
  "-gigantamax",
  "-primal",
  "-ultra",
  "-alola",
  "-galar",
  "-hisui",
  "-paldea",
  "-origin",
  "-sky",
  "-blade",
  "-shield",
  "-cap",
];
const SORTED_SUFFIXES = [...FORM_SUFFIXES].sort((a, b) => b.length - a.length);
const CAP_REGEX = /-cap.*$/;
const POWER_CONSTRUCT_REGEX = /-50-power-construct$/;

function getBattleTransformation(formId?: string): {
  kind?: string;
  isBattle?: boolean;
} {
  if (!formId) return {};
  if (["mega", "mega-x", "mega-y", "mega-z"].includes(formId)) {
    return { kind: formId, isBattle: true };
  }
  if (["gmax", "gigantamax"].includes(formId)) {
    return { kind: "gigantamax", isBattle: true };
  }
  if (["primal", "ultra"].includes(formId)) {
    return { kind: formId, isBattle: true };
  }
  return {};
}

export function parsePokemonIdentity(input: {
  id: number;
  name: string;
}): PokemonIdentity {
  const originalName = input.name;
  let normalized = originalName.toLowerCase().trim();
  let formId: string | undefined;

  if (POWER_CONSTRUCT_REGEX.test(normalized)) {
    formId = "50-power-construct";
    normalized = normalized.replace(POWER_CONSTRUCT_REGEX, "");
  }

  normalized = normalized.replace(CAP_REGEX, "");

  for (const suffix of SORTED_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      const clean = suffix.replace(/^-/, "");
      formId = formId ? `${clean}-${formId}` : clean;
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }

  const speciesId = normalized;
  const { kind: transformationKind, isBattle: isBattleTransformation } =
    getBattleTransformation(formId);

  return {
    numericId: input.id,
    originalName,
    normalizedName: normalized,
    speciesId,
    baseName: normalized,
    debugKey: `${input.id}:${originalName}${formId ? `[${formId}]` : ""}`,
    ...(formId ? { formId } : {}),
    ...(transformationKind ? { transformationKind } : {}),
    ...(isBattleTransformation ? { isBattleTransformation } : {}),
  };
}

export function extractSpeciesId(identity: PokemonIdentity): string {
  return identity.speciesId;
}
