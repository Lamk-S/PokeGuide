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
const FORM_ALIASES: Record<string, string> = {
  gigantamax: "gmax",
  "alola-totem": "totem-alola",
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
const BASE_TO_ID: Record<string, number> = {
  bulbasaur: 1,
  venusaur: 3,
  charizard: 6,
  pikachu: 25,
  raichu: 26,
  alakazam: 65,
  gengar: 94,
  absol: 359,
  garchomp: 445,
  giratina: 487,
  sylveon: 700,
};
const FORM_TO_ID: Record<string, number> = {
  "giratina-altered": 487,
  "giratina-origin": 10007,
  "charizard-gmax": 10195,
  "charizard-mega-x": 10033,
  "charizard-mega-y": 10034,
  "pikachu-rock-star": 10080,
  "pikachu-cosplay": 10081,
  "absol-mega-z": 10307,
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
  return FORM_ALIASES[raw.toLowerCase().trim()] ?? raw.toLowerCase().trim();
}
function normalizeSpeciesId(input: string): string {
  let s = input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  for (const [alias, canonical] of Object.entries(FORM_ALIASES)) {
    if (s.endsWith(`-${alias}`))
      s = `${s.slice(0, -(alias.length + 1))}-${canonical}`;
    if (s === alias) s = canonical;
  }
  return s;
}
function extractBaseAndForm(speciesId: string): { base: string; form: string } {
  const n = normalizeSpeciesId(speciesId);
  for (const suffix of FORM_SUFFIXES_ORDERED) {
    const norm = normalizeForm(suffix);
    if (n === norm) return { base: n, form: norm };
    if (n.endsWith(`-${norm}`))
      return { base: n.slice(0, -(norm.length + 1)), form: norm };
  }
  return { base: n, form: "base" };
}
function buildSmogonName(base: string, form: string): string {
  const cap = (s: string) =>
    s.length <= 1
      ? s.toUpperCase()
      : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
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
  static fromDexId(id: number, form?: string): PokemonIdentity;
  static fromDexId(
    id: number,
    speciesId?: string,
    generation?: number,
  ): PokemonIdentity;
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
        const normInput = normalizeSpeciesId(speciesIdOrForm);
        const ext = extractBaseAndForm(normInput);
        if (ext.form !== "base" && ext.form !== known.form) {
          speciesId = normInput;
          base = ext.base;
          form = ext.form;
          smogonName = buildSmogonName(base, form);
          if (base === "giratina" && form === "altered")
            smogonName = "Giratina";
          if (base === "giratina" && form === "origin")
            smogonName = "Giratina-Origin";
        } else if (
          ext.form === "base" &&
          known.form !== "base" &&
          ext.base === known.base
        ) {
          speciesId = known.speciesId;
          base = known.base;
          form = known.form;
          smogonName = known.smogonName;
        } else if (ext.form !== known.form) {
          speciesId = normInput;
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
  static fromSmogonName(name: string, generation?: number): PokemonIdentity {
    const normalized = normalizeSpeciesId(
      name.trim().toLowerCase().replace(/\s+/g, "-"),
    );
    return PokemonIdentity.fromSpeciesId(normalized, undefined, generation);
  }
  static fromSpeciesId(
    speciesIdInput: string,
    numericId?: number,
    generation?: number,
  ): PokemonIdentity {
    const normalized = normalizeSpeciesId(speciesIdInput);
    if (numericId !== undefined)
      return PokemonIdentity.fromDexId(numericId, normalized, generation);
    const knownId = FORM_TO_ID[normalized];
    if (knownId !== undefined)
      return PokemonIdentity.fromDexId(knownId, normalized, generation);
    const ext = extractBaseAndForm(normalized);
    const baseId = BASE_TO_ID[ext.base];
    if (baseId !== undefined)
      return PokemonIdentity.fromDexId(baseId, normalized, generation);
    return new PokemonIdentity({
      numericId: 0,
      dexId: 0,
      speciesId: normalized,
      base: ext.base,
      form: ext.form,
      formId: ext.form,
      originalName: speciesIdInput,
      id: normalized,
      supported: false,
      isFallbackToBase: true,
      transformationKind: ext.form,
      smogonName: buildSmogonName(ext.base, ext.form),
    });
  }
  static fromInput(
    input: { id: number; name: string } | string,
    generation?: number,
  ): PokemonIdentity {
    if (typeof input === "string")
      return PokemonIdentity.fromSmogonName(input, generation);
    return PokemonIdentity.fromDexId(input.id, input.name, generation);
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

type LegacyCoverageInput = {
  dexId?: number;
  base?: string;
  form?: string;
  displayName?: string;
  generation?: number;
};

function parseLegacyCoverageInput(
  input: unknown,
  generation?: number,
): PokemonIdentity | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as LegacyCoverageInput;
  if (typeof obj.dexId === "number") {
    const gen = obj.generation ?? generation;
    const known = ID_TO_KNOWN[obj.dexId];
    if (known && !obj.form) {
      return PokemonIdentity.fromDexId(obj.dexId, known.speciesId, gen);
    }
    const base = typeof obj.base === "string" ? obj.base : "";
    const form = typeof obj.form === "string" ? obj.form : "base";
    const displayName =
      typeof obj.displayName === "string" ? obj.displayName : undefined;
    const speciesId = displayName
      ? normalizeSpeciesId(displayName)
      : form === "base"
        ? base
        : `${base}-${form}`;
    return PokemonIdentity.fromDexId(obj.dexId, speciesId, gen);
  }
  if (typeof obj.base === "string") {
    const form = typeof obj.form === "string" ? obj.form : "base";
    const speciesId = form === "base" ? obj.base : `${obj.base}-${form}`;
    return PokemonIdentity.fromSpeciesId(speciesId, undefined, generation);
  }
  return null;
}

type IdentityObject = {
  dexId?: unknown;
  base?: unknown;
  id?: unknown;
  name?: unknown;
};

export function parsePokemonIdentity(
  input: unknown,
  generation?: number,
): PokemonIdentity {
  if (input && typeof input === "object") {
    const obj = input as IdentityObject;
    if (typeof obj.dexId === "number" || typeof obj.base === "string") {
      if (typeof obj.id !== "number") {
        const legacy = parseLegacyCoverageInput(input, generation);
        if (legacy) return legacy;
      }
    }
    if (typeof obj.id === "number" && typeof obj.name === "string") {
      return PokemonIdentity.fromInput(
        { id: obj.id, name: obj.name },
        generation,
      );
    }
  }
  if (typeof input === "string") {
    let s = input.trim();
    s = s.replace(/^#\s*\d+\s*/, "").trim();
    if (s.includes(":")) {
      const parts = s
        .split(":")
        .map((p) => p.trim())
        .filter(Boolean);
      s = parts.join("-");
    }
    return PokemonIdentity.fromInput(s, generation);
  }
  return PokemonIdentity.fromSpeciesId(String(input), undefined, generation);
}

export function inferFormFromDisplayName(displayName: string): string {
  return extractBaseAndForm(displayName).form;
}
export function normalizeFormId(form: string): string {
  return normalizeForm(form);
}
