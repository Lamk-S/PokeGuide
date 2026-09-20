import { describe, it, expect } from "vitest";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import { SpriteResolver } from "@/infrastructure/pokemon/SpriteResolver";

describe("Id-first identity", () => {
  it("mapper recibe ID y no depende de nombre como identidad interna", () => {
    const r = SmogonSpeciesMapper.resolve({ id: 487, name: "giratina-altered" }, 9);
    expect(r.smogonName).toBe("Giratina");
    expect(r.supported).toBe(true);
  });

  it("dos formas con IDs distintos no se mezclan", () => {
    const altered = SmogonSpeciesMapper.resolve({ id: 487, name: "giratina-altered" }, 9);
    const origin = SmogonSpeciesMapper.resolve({ id: 487, name: "giratina-origin" }, 9);
    expect(altered.smogonName).not.toBe(origin.smogonName);
  });

  it("forma no soportada genera error funcional en adapter", () => {
    const r = SmogonSpeciesMapper.resolve({ id: 10307, name: "absol-mega-z" }, 9);
    expect(r.supported).toBe(false);
  });

  it("sprite resolver usa ID como identidad, estático y sin fallback incorrecto", () => {
    const chainBase = SpriteResolver.getSpriteChain({ id: 487, name: "giratina-altered" }, false);
    const firstBase = chainBase[0]?? "";
    expect(firstBase).toContain("/487.png");
    expect(firstBase).toContain("/home/");

    const chainOrigin = SpriteResolver.getSpriteChain({ id: 10007, name: "giratina-origin" }, false);
    const firstOrigin = chainOrigin[0]?? "";
    expect(firstOrigin).toContain("/10007.png");
    expect(firstOrigin).not.toBe(firstBase);

    const chainPika = SpriteResolver.getSpriteChain({ id: 10080, name: "pikachu-rock-star" }, false);
    expect(chainPika[0]).toContain("/10080.png");

    const chainMegaZ = SpriteResolver.getSpriteChain({ id: 10307, name: "absol-mega-z" }, false);
    expect(chainMegaZ[0]).toContain("/10307.png");
  });

  it("Gmax en Gen 7 no soportado como Gmax", () => {
    const r = SmogonSpeciesMapper.resolve({ id: 6, name: "charizard-gmax" }, 7);
    expect(r.isFallbackToBase).toBe(true);
  });
});