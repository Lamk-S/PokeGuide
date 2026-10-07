import {
  type PokemonIdentity,
  parsePokemonIdentity,
} from "@/domain/pokemon/value-objects/PokemonIdentity";

export interface SmogonResolveResult {
  smogonName: string;
  supported: boolean;
  isFallbackToBase: boolean;
  baseName?: string;
}

type SimpleIdentity = { id: number; name: string };
type InputIdentity = SimpleIdentity | PokemonIdentity;

const CUSTOM_UNSUPPORTED = new Set([
  "absol-mega-z",
  "absol-mega-y",
  "staraptor-mega",
  "garchomp-mega-z",
  "lucario-mega-z",
]);

const FORM_MAP: Record<string, string> = {
  "giratina-altered": "Giratina",
  "giratina-origin": "Giratina-Origin",
  giratina: "Giratina",
  pikachu: "Pikachu",
  garchomp: "Garchomp",
  charmander: "Charmander",
  squirtle: "Squirtle",
  gengar: "Gengar",
  charizard: "Charizard",
  alakazam: "Alakazam",
  sylveon: "Sylveon",
  absol: "Absol",
};

function toDomainIdentity(input: InputIdentity): PokemonIdentity {
  if ("numericId" in input) return input;
  return parsePokemonIdentity({ id: input.id, name: input.name });
}

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/_/g, "-");
}

export function resolveSpecies(
  input: InputIdentity,
  generation: number,
): SmogonResolveResult {
  const identity = toDomainIdentity(input);
  const rawName = normalizeName(identity.originalName);
  const baseKey = identity.baseName;

  if (CUSTOM_UNSUPPORTED.has(rawName) || identity.numericId === 10307) {
    return {
      smogonName: FORM_MAP[baseKey] ?? "Absol",
      supported: false,
      isFallbackToBase: true,
      baseName: baseKey,
    };
  }

  if (rawName.includes("gmax") || rawName.includes("gigantamax")) {
    if (generation < 8) {
      return {
        smogonName: FORM_MAP[baseKey] ?? "Charizard",
        supported: true,
        isFallbackToBase: true,
        baseName: baseKey,
      };
    }
    const withoutGmax = rawName.replace("-gmax", "").replace("-gigantamax", "");
    return {
      smogonName: FORM_MAP[withoutGmax] ?? FORM_MAP[rawName] ?? withoutGmax,
      supported: true,
      isFallbackToBase: false,
    };
  }

  if (FORM_MAP[rawName])
    return {
      smogonName: FORM_MAP[rawName],
      supported: true,
      isFallbackToBase: false,
    };

  const baseMapped = FORM_MAP[baseKey];
  if (baseMapped) {
    return {
      smogonName: baseMapped,
      supported: true,
      isFallbackToBase: rawName !== baseKey,
      baseName: baseKey,
    };
  }

  if (generation <= 1 && rawName.includes("-"))
    return { smogonName: rawName, supported: false, isFallbackToBase: false };

  return { smogonName: rawName, supported: true, isFallbackToBase: false };
}

export const SmogonSpeciesMapper = { resolve: resolveSpecies };
export default SmogonSpeciesMapper;
