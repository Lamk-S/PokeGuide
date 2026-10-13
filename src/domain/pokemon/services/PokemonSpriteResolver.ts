import {
  PokemonIdentity,
  parsePokemonIdentity,
  type PokemonIdentityInput,
} from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolveFormFromDexId } from "@/domain/pokemon/services/PokemonFormResolver";

export type SpriteResult = {
  readonly url: string;
  readonly chain: string[];
  toString(): string;
  valueOf(): string;
};

function toIdentity(
  input: PokemonIdentity | PokemonIdentityInput,
): PokemonIdentity {
  return input instanceof PokemonIdentity
    ? input
    : parsePokemonIdentity(input as PokemonIdentityInput);
}

export class PokemonSpriteResolver {
  resolve(
    identity: PokemonIdentity | PokemonIdentityInput,
    opts: { shiny?: boolean } = {},
  ): string {
    const id = toIdentity(identity);
    const b = id.base.toLowerCase();
    let f = (id.form as string).toLowerCase() as string;

    if ((f === "base" || f === "50") && id.dexId) {
      const mapped = resolveFormFromDexId(id.dexId, id.speciesId);
      if (mapped !== "base") f = mapped;
    }

    let sid = b;
    if (f && f !== "base" && f !== "50") {
      if (f === "gmax" || f === "gigamax" || f === "gigantamax")
        sid = `${b}-gmax`;
      else if (f === "mega-x") sid = `${b}-megax`;
      else if (f === "mega-y") sid = `${b}-megay`;
      else if (f === "mega-z") sid = `${b}-megaz`;
      else if (f === "mega") sid = `${b}-mega`;
      else if (f === "cosplay") {
        const raw = id.speciesId.replace(/_/g, "-");
        sid = raw.includes("-") ? raw : `${b}-cosplay`;
      } else sid = `${b}-${f}`;
    }
    const baseUrl = opts.shiny
      ? "https://play.pokemonshowdown.com/sprites/ani-shiny"
      : "https://play.pokemonshowdown.com/sprites/ani";
    return `${baseUrl}/${sid}.gif`;
  }
}

export function resolvePokemonSprite(
  identity: PokemonIdentity | PokemonIdentityInput,
): SpriteResult {
  const id = toIdentity(identity);
  const numericId = id.numericId || id.dexId || 0;
  const resolver = new PokemonSpriteResolver();
  const showdown = resolver.resolve(id);
  const url = `/home/sprites/${numericId}.png`;
  const chain = [
    `/home/sprites/${numericId}.png`,
    `/home/${id.base}/${numericId}.png`,
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numericId}.png`,
    showdown,
    `/home/sprites/${id.base}.png`,
  ];
  const result: SpriteResult = {
    url,
    chain,
    toString() {
      return url;
    },
    valueOf() {
      return url;
    },
  };
  return Object.assign(new String(url), result) as unknown as SpriteResult;
}
