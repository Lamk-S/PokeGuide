import { describe, it, expect } from "vitest";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";

function getSpriteChain(input: { id: number; name: string }) {
  const identity = parsePokemonIdentity(input.id, input.name);
  const resolved = resolvePokemonSprite(identity);
  return resolved.chain;
}

describe("Id-first identity", () => {
  it("mapper recibe ID y no depende de nombre como identidad interna", () => {
    const identity = parsePokemonIdentity(487, "giratina-altered");
    const r = SmogonSpeciesMapper.resolve(identity, 9);
    expect(r.smogonName).toBe("Giratina");
    expect(r.supported).toBe(true);
  });

  it("dos formas con IDs distintos no se mezclan", () => {
    const alteredId = parsePokemonIdentity(487, "giratina-altered");
    const originId = parsePokemonIdentity(487, "giratina-origin");
    const altered = SmogonSpeciesMapper.resolve(alteredId, 9);
    const origin = SmogonSpeciesMapper.resolve(originId, 9);
    expect(altered.smogonName).not.toBe(origin.smogonName);
  });

  it("forma no soportada genera error funcional en adapter", () => {
    const id = parsePokemonIdentity(10307, "absol-mega-z");
    const r = SmogonSpeciesMapper.resolve(id, 9);
    expect(r.supported).toBe(false);
  });

  it("sprite resolver usa ID como identidad, estático y sin fallback incorrecto", () => {
    const chainBase = getSpriteChain({ id: 487, name: "giratina-altered" });
    const firstBase = chainBase[0] ?? "";
    expect(firstBase).toContain("/487.png");
    expect(firstBase).toContain("/home/");

    const chainOrigin = getSpriteChain({ id: 10007, name: "giratina-origin" });
    const firstOrigin = chainOrigin[0] ?? "";
    expect(firstOrigin).toContain("/10007.png");
    expect(firstOrigin).not.toBe(firstBase);

    const chainPika = getSpriteChain({ id: 10080, name: "pikachu-rock-star" });
    expect(chainPika[0]).toContain("/10080.png");

    const chainMegaZ = getSpriteChain({ id: 10307, name: "absol-mega-z" });
    expect(chainMegaZ[0]).toContain("/10307.png");
  });

  it("Gmax en Gen 7 no soportado como Gmax", () => {
    const id = parsePokemonIdentity(6, "charizard-gmax");
    const r = SmogonSpeciesMapper.resolve(id, 7);
    expect(r.isFallbackToBase).toBe(true);
  });
});
