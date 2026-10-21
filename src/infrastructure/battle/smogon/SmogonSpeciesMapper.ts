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

const FORM_ALIASES: Record<string, string> = {
  gigantamax: "gmax",
  "alola-totem": "totem-alola",
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

const FORM_SUFFIXES_ORDERED: string[] = [
  "mega-z",
  "mega-y",
  "mega-x",
  "rock-star",
  "totem-alola",
  "origin",
  "altered",
  "gmax",
  "gigantamax",
  "mega",
  "alola",
  "galar",
  "hisui",
  "paldea",
  "cosplay",
  "totem",
  "50",
];

type IdentityInput = { id: number; name: string } | string;

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

function normalizeForm(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return FORM_ALIASES[lower] ?? lower;
}

function normalizeSpeciesId(input: string): string {
  let s = input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (s.endsWith("-gigantamax")) {
    s = `${s.slice(0, -"gigantamax".length - 1)}-gmax`;
  }
  if (s === "gigantamax") s = "gmax";
  for (const [alias, canonical] of Object.entries(FORM_ALIASES)) {
    if (s.endsWith(`-${alias}`)) {
      s = `${s.slice(0, -(alias.length + 1))}-${canonical}`;
    }
    if (s === alias) s = canonical;
  }
  return s;
}

function extractBaseAndForm(speciesId: string): { base: string; form: string } {
  const n = normalizeSpeciesId(speciesId);
  for (const suffix of FORM_SUFFIXES_ORDERED) {
    const norm = normalizeForm(suffix);
    if (n === norm) return { base: n, form: norm };
    if (n.endsWith(`-${norm}`)) {
      return { base: n.slice(0, -(norm.length + 1)), form: norm };
    }
  }
  return { base: n, form: "base" };
}

function buildSmogonName(base: string, form: string): string {
  const cap = (s: string) =>
    s.length <= 1
      ? s.toUpperCase()
      : `${s.charAt(0).toUpperCase()}${s.slice(1).toLowerCase()}`;
  const baseCap = base.split("-").map(cap).join("-");
  if (form === "base" || form === "altered") return baseCap;
  return `${baseCap}-${form
    .split("-")
    .map((p) => (p.length === 1 ? p.toUpperCase() : cap(p)))
    .join("-")}`;
}

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
  if (numericId > 0 && numericId <= 1025 && numericId > getMaxDexForGen(g))
    return { supported: false, isFallbackToBase: true };
  if (g < rule.minGen) return { supported: false, isFallbackToBase: true };
  if (rule.maxGen !== undefined && g > rule.maxGen)
    return { supported: false, isFallbackToBase: true };
  return { supported: true, isFallbackToBase: false };
}

function parseInput(input: IdentityInput): {
  numericId: number;
  speciesId: string;
  base: string;
  form: string;
  originalName: string;
} {
  if (typeof input === "string") {
    const norm = normalizeSpeciesId(input);
    const { base, form } = extractBaseAndForm(norm);
    return { numericId: 0, speciesId: norm, base, form, originalName: input };
  }
  const norm = normalizeSpeciesId(input.name);
  const { base, form } = extractBaseAndForm(norm);
  return {
    numericId: input.id,
    speciesId: norm,
    base,
    form,
    originalName: input.name,
  };
}

export class SmogonSpeciesMapper {
  static normalize(input: string): string {
    return normalizeSpeciesId(input);
  }

  static toSmogon(input: string, gen?: number): string {
    const { base, form } = extractBaseAndForm(input);
    const sup = evaluateSupport(0, form, gen);
    if (!sup.supported && form !== "base" && form !== "altered") return base;
    return buildSmogonName(base, form);
  }

  static toShowdown(input: string, gen?: number): string {
    return SmogonSpeciesMapper.toSmogon(input, gen).toLowerCase();
  }

  static fromSmogon(smogonName: string): string {
    return normalizeSpeciesId(smogonName.replace(/\s+/g, "-"));
  }

  static getMaxDex(gen: number): number {
    return getMaxDexForGen(gen);
  }

  static isSupported(form: string, gen?: number): boolean {
    return evaluateSupport(0, form, gen).supported;
  }

  static resolve(input: IdentityInput, gen?: number): SmogonResolveResult {
    const parsed = parseInput(input);
    const sup = evaluateSupport(parsed.numericId, parsed.form, gen);
    let smogonName = buildSmogonName(parsed.base, parsed.form);
    if (parsed.base === "giratina" && parsed.form === "altered")
      smogonName = "Giratina";
    if (parsed.base === "giratina" && parsed.form === "origin")
      smogonName = "Giratina-Origin";
    if (parsed.base === "pikachu" && parsed.form === "base")
      smogonName = "Pikachu";
    if (parsed.base === "charizard" && parsed.form === "gmax")
      smogonName = "Charizard-Gmax";

    return {
      speciesId: parsed.speciesId,
      smogonName,
      base: parsed.base,
      form: parsed.form,
      supported: sup.supported,
      isFallbackToBase: sup.isFallbackToBase,
      numericId: parsed.numericId,
      dexId: parsed.numericId,
    };
  }

  static map(input: IdentityInput, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.resolve(input, gen);
  }

  resolve(input: IdentityInput, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.resolve(input, gen);
  }

  map(input: IdentityInput, gen?: number): SmogonResolveResult {
    return SmogonSpeciesMapper.map(input, gen);
  }

  static extractBaseAndForm(speciesId: string): { base: string; form: string } {
    return extractBaseAndForm(speciesId);
  }

  static buildSmogonName(base: string, form: string): string {
    return buildSmogonName(base, form);
  }
}

export function smogonToSpeciesId(smogonName: string): string {
  return SmogonSpeciesMapper.fromSmogon(smogonName);
}

export function speciesIdToSmogon(speciesId: string, gen?: number): string {
  return SmogonSpeciesMapper.toSmogon(speciesId, gen);
}

export function getMaxDexForGeneration(gen: number): number {
  return getMaxDexForGen(gen);
}

export default SmogonSpeciesMapper;
