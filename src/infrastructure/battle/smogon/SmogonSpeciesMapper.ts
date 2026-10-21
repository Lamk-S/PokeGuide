import type { PokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";

const MAX_DEX_BY_GEN: Record<number, number> = {
  1: 151,
  2: 251,
  3: 386,
  4: 493,
  5: 649,
  6: 721,
  7: 809,
  8: 905,
  9: 1025,
};

const FORM_RULES: Record<
  string,
  { minGen: number; maxGen?: number; alwaysUnsupported?: boolean }
> = {
  base: { minGen: 1 },
  altered: { minGen: 4 },
  origin: { minGen: 4 },
  mega: { minGen: 6, maxGen: 7 },
  "mega-x": { minGen: 6, maxGen: 7 },
  "mega-y": { minGen: 6, maxGen: 7 },
  "mega-z": { minGen: 1, alwaysUnsupported: true },
  gmax: { minGen: 8 },
  alola: { minGen: 7 },
  galar: { minGen: 8 },
  hisui: { minGen: 8 },
  paldea: { minGen: 9 },
  cosplay: { minGen: 1, alwaysUnsupported: true },
  "rock-star": { minGen: 1, alwaysUnsupported: true },
  totem: { minGen: 7 },
  "totem-alola": { minGen: 7 },
};

export type SmogonResolveResult = {
  speciesId: string;
  smogonName: string;
  base: string;
  form: string;
  supported: boolean;
  isFallbackToBase: boolean;
  numericId: number;
  dexId: number;
};

function getMaxDexForGen(gen: number): number {
  return MAX_DEX_BY_GEN[gen] ?? MAX_DEX_BY_GEN[9] ?? 1025;
}

function evaluateSupport(
  numericId: number,
  form: string,
  gen: number | undefined,
) {
  const g = gen ?? 9;
  if (numericId >= 10307) return { supported: false, isFallbackToBase: true };
  const rule = FORM_RULES[form] ?? FORM_RULES.base;
  if (!rule) return { supported: false, isFallbackToBase: true };
  if (rule.alwaysUnsupported)
    return { supported: false, isFallbackToBase: true };
  if (numericId <= 1025 && numericId > getMaxDexForGen(g))
    return { supported: false, isFallbackToBase: true };
  if (g < rule.minGen) return { supported: false, isFallbackToBase: true };
  if (rule.maxGen !== undefined && g > rule.maxGen)
    return { supported: false, isFallbackToBase: true };
  return { supported: true, isFallbackToBase: false };
}

export class SmogonSpeciesMapper {
  static resolve(identity: PokemonIdentity, gen?: number): SmogonResolveResult {
    const sup = evaluateSupport(identity.numericId, identity.form, gen);
    return {
      speciesId: identity.speciesId,
      smogonName: identity.smogonName,
      base: identity.base,
      form: identity.form,
      supported: sup.supported,
      isFallbackToBase: sup.isFallbackToBase,
      numericId: identity.numericId,
      dexId: identity.dexId,
    };
  }

  static map(identity: PokemonIdentity, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.resolve(identity, gen);
  }

  resolve(identity: PokemonIdentity, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.resolve(identity, gen);
  }

  map(identity: PokemonIdentity, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.resolve(identity, gen);
  }

  static getMaxDex(gen: number): number {
    return getMaxDexForGen(gen);
  }
}

export default SmogonSpeciesMapper;
