import type { PokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { normalizeId } from "@/domain/shared/utils/normalizeId";

export type PokemonForm =
  | "base"
  | "gmax"
  | "gigamax"
  | "gigantamax"
  | "mega"
  | "mega-x"
  | "mega-y"
  | "mega-z"
  | "hisui"
  | "alola"
  | "galar"
  | "paldea"
  | "totem"
  | "totem-alola"
  | "alola-totem"
  | "origin"
  | "altered"
  | "cosplay"
  | "50";

export const DEBUT_GENERATION: Record<string, number> = {
  base: 1,
  "50": 1,
  altered: 4,
  origin: 4,
  alola: 7,
  "alola-totem": 7,
  "totem-alola": 7,
  totem: 7,
  galar: 8,
  hisui: 8,
  paldea: 9,
  mega: 6,
  "mega-x": 6,
  "mega-y": 6,
  "mega-z": 6,
  gmax: 8,
  gigantamax: 8,
  gigamax: 8,
  cosplay: 6,
};

const FORM_MAP: Record<number, PokemonForm> = {
  487: "altered",
  10007: "origin",
  10033: "mega-x",
  10034: "mega-x",
  10035: "mega-y",
  10036: "mega",
  10037: "mega",
  10195: "gmax",
  10196: "gmax",
  10197: "gmax",
  10198: "gmax",
  10199: "gmax",
  10200: "gmax",
  10201: "gmax",
  10202: "gmax",
  10203: "gmax",
  10204: "gmax",
  10205: "gmax",
  10206: "gmax",
  10207: "gmax",
  10208: "gmax",
  10209: "gmax",
  10210: "gmax",
  10211: "gmax",
  10212: "gmax",
  10213: "gmax",
  10214: "gmax",
  10215: "gmax",
  10216: "gmax",
  10217: "gmax",
  10218: "gmax",
  10219: "gmax",
  10220: "gmax",
  10221: "gmax",
  10222: "gmax",
  10223: "gmax",
  10224: "gmax",
  10225: "gmax",
  10226: "gmax",
  10227: "gmax",
  10228: "gmax",
  10100: "alola",
  10101: "alola",
  10102: "alola",
  10103: "alola",
  10104: "alola",
  10105: "alola",
  10106: "alola",
  10107: "alola",
  10108: "alola",
  10109: "alola",
  10110: "alola",
  10111: "alola",
  10112: "alola",
  10113: "alola",
  10114: "alola",
  10115: "alola",
  10093: "totem-alola",
  10229: "hisui",
  10230: "hisui",
  10231: "hisui",
  10232: "hisui",
  10233: "hisui",
  10234: "hisui",
  10235: "hisui",
  10158: "galar",
  10159: "galar",
  10080: "cosplay",
  10081: "cosplay",
  10082: "cosplay",
  10083: "cosplay",
  10084: "cosplay",
  10085: "cosplay",
};

export function inferFormFromDisplayName(name: string): PokemonForm {
  const n = name.toLowerCase();
  if (/(gigamax|gigantamax|gmax)/.test(n)) return "gmax";
  if (/mega[-_\s]*x/.test(n)) return "mega-x";
  if (/mega[-_\s]*y/.test(n)) return "mega-y";
  if (/mega[-_\s]*z/.test(n)) return "mega-z";
  if (/mega/.test(n)) return "mega";
  if (/totem.*alola|alola.*totem/.test(n)) return "totem-alola";
  if (/totem/.test(n)) return "totem";
  if (/hisui/.test(n)) return "hisui";
  if (/alola/.test(n)) return "alola";
  if (/galar/.test(n)) return "galar";
  if (/paldea/.test(n)) return "paldea";
  if (/\borigin\b/.test(n)) return "origin";
  if (/\baltered\b/.test(n)) return "altered";
  if (/\bcosplay\b/.test(n) || /rock-star|belle|pop-star|phd|libre|cap/.test(n))
    return "cosplay";
  if (/\b50\b/.test(n)) return "50";
  return "base";
}

export function resolveFormFromDexId(
  dexId: number,
  fallbackName = "",
): PokemonForm {
  const mapped = FORM_MAP[dexId];
  if (mapped) return mapped;
  const inferred = inferFormFromDisplayName(fallbackName);
  if (inferred !== "base") return inferred;
  if (dexId >= 10195 && dexId <= 10228) return "gmax";
  if (dexId >= 10033 && dexId <= 10090) return "mega";
  if (dexId >= 10100 && dexId <= 10120) return "alola";
  if (dexId >= 10229 && dexId <= 10270) return "hisui";
  if (dexId >= 10150 && dexId <= 10170) return "galar";
  if (dexId >= 10307 && dexId <= 10310) return "mega-z";
  return "base";
}

export function normalizeForm(form: string): PokemonForm {
  const f = form.toLowerCase().trim() as PokemonForm;
  if (f === "gigamax" || f === "gigantamax") return "gmax";
  if (f === "alola-totem") return "totem-alola";
  return (f as PokemonForm) || "base";
}

type PokemonLike = { id: number; name: string; [k: string]: unknown };
type ResolvedFormResult = {
  form: PokemonForm;
  formPokemon: PokemonLike | null;
  basePokemon: PokemonLike | null;
  toString: () => string;
};
type IdentityLike =
  | PokemonIdentity
  | string
  | { dexId: number; base: string; form: PokemonForm };

function findPokemon(
  pokemonList: PokemonLike[],
  identity: { dexId: number; base: string },
) {
  const baseNorm = normalizeId(identity.base);
  const basePokemon: PokemonLike | null =
    pokemonList.find((p) => p.id === identity.dexId) ??
    pokemonList.find((p) => normalizeId(p.name) === baseNorm) ??
    pokemonList.find((p) => normalizeId(p.name).startsWith(baseNorm)) ??
    null;
  return { basePokemon, formPokemon: basePokemon };
}

export function resolvePokemonForm(identity: IdentityLike): PokemonForm;
export function resolvePokemonForm(
  identity: IdentityLike,
  pokemonList: PokemonLike[],
): ResolvedFormResult;
export function resolvePokemonForm(
  identity: IdentityLike,
  pokemonList?: PokemonLike[],
): PokemonForm | ResolvedFormResult | null {
  if (!identity) return null;
  const idObj =
    typeof identity === "string"
      ? { dexId: 0, base: identity, form: inferFormFromDisplayName(identity) }
      : "dexId" in identity
        ? (identity as { dexId: number; base: string; form: PokemonForm })
        : {
            dexId: (identity as PokemonIdentity).dexId,
            base: (identity as PokemonIdentity).base,
            form: (identity as PokemonIdentity).form as PokemonForm,
          };
  if (!pokemonList || pokemonList.length === 0) return idObj.form;
  const { basePokemon, formPokemon } = findPokemon(pokemonList, idObj);
  return {
    form: idObj.form,
    formPokemon,
    basePokemon,
    toString: () => idObj.form,
  };
}
