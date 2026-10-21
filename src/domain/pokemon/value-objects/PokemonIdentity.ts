export type TransformationKind = string;

export interface ParsedIdentity {
  numericId: number;
  dexId: number;
  speciesId: string;
  base: string;
  form: string;
  formId: string;
  originalName: string;
  id: string;
  supported: boolean;
  isFallbackToBase: boolean;
  transformationKind: TransformationKind;
  smogonName: string;
}

export interface PokemonIdentityProps extends ParsedIdentity {}

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

const ID_TO_KNOWN: Record<
  number,
  {
    speciesId: string;
    base: string;
    form: string;
    smogonName: string;
    minGen: number;
    maxGen?: number;
    alwaysUnsupported?: boolean;
  }
> = {
  487: {
    speciesId: "giratina-altered",
    base: "giratina",
    form: "altered",
    smogonName: "Giratina",
    minGen: 4,
  },
  10007: {
    speciesId: "giratina-origin",
    base: "giratina",
    form: "origin",
    smogonName: "Giratina-Origin",
    minGen: 4,
  },
  10080: {
    speciesId: "pikachu-rock-star",
    base: "pikachu",
    form: "rock-star",
    smogonName: "Pikachu-Rock-Star",
    minGen: 1,
    alwaysUnsupported: true,
  },
  10081: {
    speciesId: "pikachu-cosplay",
    base: "pikachu",
    form: "cosplay",
    smogonName: "Pikachu-Cosplay",
    minGen: 1,
    alwaysUnsupported: true,
  },
  10195: {
    speciesId: "charizard-gmax",
    base: "charizard",
    form: "gmax",
    smogonName: "Charizard-Gmax",
    minGen: 8,
  },
  10033: {
    speciesId: "charizard-mega-x",
    base: "charizard",
    form: "mega-x",
    smogonName: "Charizard-Mega-X",
    minGen: 6,
    maxGen: 7,
  },
  10034: {
    speciesId: "charizard-mega-y",
    base: "charizard",
    form: "mega-y",
    smogonName: "Charizard-Mega-Y",
    minGen: 6,
    maxGen: 7,
  },
  10307: {
    speciesId: "absol-mega-z",
    base: "absol",
    form: "mega-z",
    smogonName: "Absol-Mega-Z",
    minGen: 1,
    alwaysUnsupported: true,
  },
};

function normalizeForm(raw: string): string {
  return raw.toLowerCase().trim() || "base";
}
function normalizeSpeciesId(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function extractBaseAndForm(speciesId: string): { base: string; form: string } {
  const n = normalizeSpeciesId(speciesId);
  const suffixes = [
    "mega-z",
    "mega-y",
    "mega-x",
    "rock-star",
    "totem-alola",
    "origin",
    "altered",
    "gmax",
    "mega",
    "alola",
    "galar",
    "hisui",
    "paldea",
    "cosplay",
    "totem",
  ];
  for (const suffix of suffixes) {
    if (n === suffix) return { base: n, form: suffix };
    if (n.endsWith(`-${suffix}`))
      return { base: n.slice(0, -(suffix.length + 1)), form: suffix };
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
  const known = ID_TO_KNOWN[numericId];
  if (known?.alwaysUnsupported)
    return { supported: false, isFallbackToBase: true };
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

export class PokemonIdentity implements ParsedIdentity {
  readonly numericId: number;
  readonly dexId: number;
  readonly speciesId: string;
  readonly base: string;
  readonly form: string;
  readonly formId: string;
  readonly originalName: string;
  readonly id: string;
  readonly supported: boolean;
  readonly isFallbackToBase: boolean;
  readonly transformationKind: TransformationKind;
  readonly smogonName: string;

  private constructor(props: PokemonIdentityProps) {
    this.numericId = props.numericId;
    this.dexId = props.dexId;
    this.speciesId = props.speciesId;
    this.base = props.base;
    this.form = props.form;
    this.formId = props.formId;
    this.originalName = props.originalName;
    this.id = props.id;
    this.supported = props.supported;
    this.isFallbackToBase = props.isFallbackToBase;
    this.transformationKind = props.transformationKind;
    this.smogonName = props.smogonName;
    Object.freeze(this);
  }

  static fromDexId(
    id: number,
    speciesIdOrForm?: string,
    generation?: number,
  ): PokemonIdentity {
    if (!Number.isInteger(id) || id <= 0)
      throw new Error(`Invalid numericId: ${id}`);
    const known = ID_TO_KNOWN[id];
    let speciesId: string;
    let base: string;
    let form: string;
    let smogonName: string;
    if (known) {
      if (speciesIdOrForm) {
        const norm = normalizeSpeciesId(speciesIdOrForm);
        const ext = extractBaseAndForm(norm);
        if (ext.form !== "base" && ext.form !== known.form) {
          speciesId = norm;
          base = ext.base;
          form = ext.form;
          smogonName = buildSmogonName(base, form);
          if (base === "giratina" && form === "altered")
            smogonName = "Giratina";
          if (base === "giratina" && form === "origin")
            smogonName = "Giratina-Origin";
        } else {
          speciesId = known.speciesId;
          base = known.base;
          form = known.form;
          smogonName = known.smogonName;
        }
      } else {
        speciesId = known.speciesId;
        base = known.base;
        form = known.form;
        smogonName = known.smogonName;
      }
    } else {
      if (speciesIdOrForm) {
        speciesId = normalizeSpeciesId(speciesIdOrForm);
        const ext = extractBaseAndForm(speciesId);
        base = ext.base || speciesId;
        form = normalizeForm(ext.form);
        smogonName = buildSmogonName(base, form);
        if (base === "giratina" && form === "altered") smogonName = "Giratina";
        if (base === "giratina" && form === "origin")
          smogonName = "Giratina-Origin";
      } else {
        speciesId = `pokemon-${id}`;
        base = speciesId;
        form = "base";
        smogonName = buildSmogonName(base, form);
      }
    }
    const sup = evaluateSupport(id, form, generation);
    return new PokemonIdentity({
      numericId: id,
      dexId: id,
      speciesId,
      base,
      form,
      formId: form,
      originalName: speciesIdOrForm ?? `${id}`,
      id: speciesId,
      supported: sup.supported,
      isFallbackToBase: sup.isFallbackToBase,
      transformationKind: form,
      smogonName,
    });
  }

  toString(): string {
    return `${this.numericId}:${this.speciesId}`;
  }
  equals(other: PokemonIdentity): boolean {
    return (
      this.numericId === other.numericId && this.speciesId === other.speciesId
    );
  }
}

export function parsePokemonIdentity(
  id: number,
  nameOrForm?: string,
  generation?: number,
): PokemonIdentity {
  if (!Number.isInteger(id) || id <= 0)
    throw new Error(
      `parsePokemonIdentity requires a valid numeric id, got ${id}`,
    );
  return PokemonIdentity.fromDexId(id, nameOrForm, generation);
}
export function inferFormFromDisplayName(displayName: string): string {
  return extractBaseAndForm(displayName).form;
}
export function normalizeFormId(form: string): string {
  return normalizeForm(form);
}
