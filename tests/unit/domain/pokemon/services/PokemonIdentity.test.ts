import { describe, it, expect } from "vitest";
import { PokemonIdentity, parsePokemonIdentity, inferFormFromDisplayName, normalizeFormId } from "@/domain/pokemon/value-objects/PokemonIdentity";

describe("PokemonIdentity - coverage estricto", () => {
  it("fromDexId con id conocido 487 altered", () => {
    const id = PokemonIdentity.fromDexId(487);
    expect(id.numericId).toBe(487);
    expect(id.form).toBe("altered");
    expect(id.base).toBe("giratina");
    expect(id.smogonName).toBe("Giratina");
    expect(id.supported).toBe(true);
  });

  it("fromDexId con id 10007 origin", () => {
    const id = PokemonIdentity.fromDexId(10007);
    expect(id.form).toBe("origin");
    expect(id.smogonName).toBe("Giratina-Origin");
    expect(id.supported).toBe(true);
  });

  it("fromDexId con id + forma explícita distinta respeta forma", () => {
    const id = PokemonIdentity.fromDexId(487, "giratina-origin");
    expect(id.form).toBe("origin");
    expect(id.speciesId).toBe("giratina-origin");
  });

  it("fromDexId con id + solo base mantiene conocido origin para 10007", () => {
    const id = PokemonIdentity.fromDexId(10007, "giratina");
    expect(id.form).toBe("origin");
  });

  it("fromDexId con id desconocido y sin nombre", () => {
    const id = PokemonIdentity.fromDexId(9999);
    expect(id.numericId).toBe(9999);
    expect(id.form).toBe("base");
    expect(id.speciesId).toBe("pokemon-9999");
  });

  it("fromDexId con id desconocido + forma", () => {
    const id = PokemonIdentity.fromDexId(6, "charizard-gmax");
    expect(id.base).toBe("charizard");
    expect(id.form).toBe("gmax");
    expect(id.smogonName).toBe("Charizard-Gmax");
  });

  it("fromDexId con id >=10307 es fallback", () => {
    const id = PokemonIdentity.fromDexId(10307);
    expect(id.isFallbackToBase).toBe(true);
    expect(id.supported).toBe(false);
  });

  it("fromDexId con generación que no soporta forma", () => {
    const id = PokemonIdentity.fromDexId(6, "charizard-gmax", 7);
    expect(id.supported).toBe(false);
    expect(id.isFallbackToBase).toBe(true);
  });

  it("fromDexId con mega en gen 7 soportado y gen 8 no", () => {
    const gen7 = PokemonIdentity.fromDexId(6, "charizard-mega-x", 7);
    expect(gen7.supported).toBe(true);
    const gen8 = PokemonIdentity.fromDexId(6, "charizard-mega-x", 8);
    expect(gen8.supported).toBe(false);
  });

  it("fromDexId con cosplay y rock-star siempre no soportado", () => {
    const cos = PokemonIdentity.fromDexId(10081);
    expect(cos.supported).toBe(false);
    const rock = PokemonIdentity.fromDexId(10080);
    expect(rock.supported).toBe(false);
  });

  it("parsePokemonIdentity estricto id-first", () => {
    const id = parsePokemonIdentity(25, "pikachu", 9);
    expect(id.numericId).toBe(25);
    expect(id.base).toBe("pikachu");
  });

  it("parsePokemonIdentity lanza con id inválido", () => {
    expect(() => parsePokemonIdentity(0)).toThrow();
    expect(() => parsePokemonIdentity(-1)).toThrow();
    expect(() => parsePokemonIdentity(NaN as unknown as number)).toThrow();
  });

  it("inferFormFromDisplayName y normalizeFormId", () => {
    expect(inferFormFromDisplayName("giratina-origin")).toBe("origin");
    expect(inferFormFromDisplayName("charizard-mega-x")).toBe("mega-x");
    expect(inferFormFromDisplayName("pikachu")).toBe("base");
    expect(normalizeFormId("GMAX")).toBe("gmax");
    expect(normalizeFormId("  Origin ")).toBe("origin");
  });

  it("fromDexId con alola, galar, hisui, paldea minGen", () => {
    const alola = PokemonIdentity.fromDexId(25, "pikachu-alola", 7);
    expect(alola.supported).toBe(true);
    const alolaGen6 = PokemonIdentity.fromDexId(25, "pikachu-alola", 6);
    expect(alolaGen6.supported).toBe(false);

    const galar = PokemonIdentity.fromDexId(25, "pikachu-galar", 8);
    expect(galar.supported).toBe(true);

    const hisui = PokemonIdentity.fromDexId(25, "pikachu-hisui", 8);
    expect(hisui.supported).toBe(true);

    const paldea = PokemonIdentity.fromDexId(25, "pikachu-paldea", 9);
    expect(paldea.supported).toBe(true);
    const paldeaGen8 = PokemonIdentity.fromDexId(25, "pikachu-paldea", 8);
    expect(paldeaGen8.supported).toBe(false);
  });

  it("fromDexId con gen > maxDex", () => {
    const id = PokemonIdentity.fromDexId(1000, undefined, 1);
    expect(id.supported).toBe(false);
  });

  it("toString y equals", () => {
    const a = parsePokemonIdentity(25, "pikachu");
    const b = parsePokemonIdentity(25, "pikachu");
    const c = parsePokemonIdentity(6, "charizard");
    expect(a.toString()).toContain("25");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
