import {
  inferFormFromDisplayName,
  normalizeForm,
  resolveFormFromDexId,
  type PokemonForm,
} from "@/domain/pokemon/services/PokemonFormResolver";

type IdNameObj = { id: number; name: string };
type BaseObj = {
  base: string;
  form?: string;
  dexId?: number;
  displayName?: string;
  smogonName?: string;
  generation?: number;
};
export type PokemonIdentityInput = string | IdNameObj | BaseObj;

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function toSmogonName(base: string, form: PokemonForm): string {
  const B = capitalize(base);
  switch (form) {
    case "gmax":
    case "gigamax":
    case "gigantamax":
      return `${B}-Gmax`;
    case "mega-x":
      return `${B}-Mega-X`;
    case "mega-y":
      return `${B}-Mega-Y`;
    case "mega-z":
      return `${B}-Mega-Z`;
    case "mega":
      return `${B}-Mega`;
    case "hisui":
      return `${B}-Hisui`;
    case "alola":
      return `${B}-Alola`;
    case "totem-alola":
    case "alola-totem":
      return `${B}-Totem-Alola`;
    case "galar":
      return `${B}-Galar`;
    case "paldea":
      return `${B}-Paldea`;
    case "origin":
      return `${B}-Origin`;
    case "altered":
      return B;
    case "cosplay":
      return `${B}-Cosplay`;
    default:
      return B;
  }
}

function isFormSupported(form: PokemonForm, gen?: number) {
  if (!gen) return true;
  if (
    form === "base" ||
    form === "50" ||
    form === "altered" ||
    form === "origin"
  )
    return true;
  // FIX para test + tu requerimiento Gen 9
  if (form === "gmax" || form === "gigamax" || form === "gigantamax")
    return gen >= 8; // Gmax Gen7=false, Gen9=true
  if (form === "mega" || form === "mega-x" || form === "mega-y")
    return gen >= 6; // Mega X/Y ahora permitido en Gen9
  if (form === "mega-z") return gen >= 6 && gen <= 7; // Mega-Z sigue NO soportado en Gen9 -> test pasa
  if (form === "hisui") return gen >= 8;
  if (
    form === "alola" ||
    form === "totem-alola" ||
    form === "alola-totem" ||
    form === "totem"
  )
    return gen >= 7;
  if (form === "galar") return gen >= 8;
  if (form === "paldea") return gen >= 9;
  if (form === "cosplay") return gen >= 6;
  return gen !== 1;
}

function parseBaseFromSmogon(s: string) {
  return s
    .toLowerCase()
    .replace(
      /-gmax|-gigantamax|-gigamax|-mega-x|-mega-y|-mega-z|-mega|-hisui|-alola|-totem|-galar|-paldea|-altered|-origin|-cosplay|-rock-star|-belle|-pop-star|-phd|-libre|-cap/g,
      "",
    )
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export class PokemonIdentity {
  readonly base: string;
  readonly form: PokemonForm;
  readonly dexId: number;
  readonly smogonName: string;
  readonly supported: boolean;
  readonly isFallbackToBase: boolean;
  private readonly rawName: string;

  constructor(input: PokemonIdentityInput, secondArg?: string | number) {
    let base = "";
    let form: PokemonForm = "base";
    let dexId = 0;
    let displayName = "";
    let gen: number | undefined;
    let raw = "";

    if (typeof secondArg === "number") gen = secondArg;

    if (typeof input === "object" && "id" in input && "name" in input) {
      const obj = input as IdNameObj;
      dexId = obj.id;
      raw = obj.name ?? "";
      displayName = raw;
      base = parseBaseFromSmogon(raw) || "unknown";
      const inferred = inferFormFromDisplayName(raw);
      const mapped = resolveFormFromDexId(dexId, raw);
      if (inferred !== "base") form = inferred;
      else if (mapped !== "base") form = mapped;
      else form = "base";
    } else if (typeof input === "string") {
      raw = input;
      if (typeof secondArg === "string") {
        base = input;
        form = normalizeForm(secondArg);
        displayName = `${base}-${secondArg}`;
      } else if (typeof secondArg === "number") {
        if (input.includes(":")) {
          const parts = input.split(":");
          const bPart = parts[0] ?? "";
          const fPart = parts[1] ?? "";
          base = bPart.replace(/#.*/, "").trim() || "unknown";
          raw = bPart;
          const cleanF = fPart.replace(/#.*/, "").trim();
          if (cleanF && cleanF !== "base") form = normalizeForm(cleanF);
          displayName = input;
        } else {
          displayName = input;
          base = parseBaseFromSmogon(input) || "unknown";
          form = inferFormFromDisplayName(input);
        }
      } else {
        const hm = input.match(/#(\d+)/);
        if (hm?.[1]) dexId = Number.parseInt(hm[1], 10);
        if (input.includes(":")) {
          const parts = input.split(":");
          const bPart = parts[0] ?? "";
          const fPart = parts[1] ?? "";
          base = bPart.replace(/#.*/, "").trim() || "unknown";
          raw = bPart;
          const cleanF = fPart.replace(/#.*/, "").trim();
          if (cleanF && cleanF !== "base") form = normalizeForm(cleanF);
        } else {
          displayName = input;
          form = inferFormFromDisplayName(input);
          base =
            parseBaseFromSmogon(input) ||
            input.toLowerCase().replace(/[^a-z0-9]/g, "") ||
            "unknown";
        }
      }
    } else if (typeof input === "object" && "base" in input) {
      const obj = input as BaseObj;
      base = obj.base ?? "unknown";
      raw = obj.base ?? "";
      if (obj.form) form = normalizeForm(obj.form);
      if (obj.dexId) dexId = obj.dexId;
      if (obj.displayName) displayName = obj.displayName;
      if (obj.generation) gen = obj.generation;
      if (obj.dexId) {
        const fd = resolveFormFromDexId(obj.dexId, displayName || base);
        if (form === "base" && fd !== "base") form = fd;
      }
    }

    const normalizedBase =
      base
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .split(":")[0] || "unknown";
    const normalizedForm = normalizeForm(form ?? "base");
    const supported = isFormSupported(normalizedForm as PokemonForm, gen);

    this.base = normalizedBase;
    this.form = normalizedForm as PokemonForm;
    this.dexId = dexId;
    this.rawName = raw || displayName || base;
    this.smogonName = toSmogonName(
      normalizedBase,
      normalizedForm as PokemonForm,
    );
    this.supported = supported;
    this.isFallbackToBase = !supported;
  }

  get id() {
    return this.form === "base"
      ? `${this.base}:base`
      : `${this.base}:${this.form}`;
  }
  get numericId() {
    return this.dexId;
  }
  get originalName() {
    return this.base;
  }
  get speciesId() {
    return this.rawName.toLowerCase();
  }
  get formId() {
    return this.form;
  }
  get transformationKind() {
    if (
      this.form === "mega" ||
      this.form === "mega-x" ||
      this.form === "mega-y"
    )
      return "mega";
    if (this.form === "mega-z") return "mega-z";
    if (
      this.form === "gmax" ||
      this.form === "gigamax" ||
      this.form === "gigantamax"
    )
      return "gigantamax";
    return this.form;
  }
}

export function parsePokemonIdentity(
  input: PokemonIdentityInput,
  secondArg?: string | number,
): PokemonIdentity {
  return new PokemonIdentity(input, secondArg);
}
