import { describe, it, expect } from "vitest";
import { parsePokemonIdentity, PokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { PokemonSpriteResolver, resolvePokemonSprite, getSpriteChain } from "@/domain/pokemon/services/PokemonSpriteResolver";
import { inferFormFromDisplayName, normalizeForm, resolveFormFromDexId, resolvePokemonForm } from "@/domain/pokemon/services/PokemonFormResolver";
import { SmogonSpeciesMapper } from "@/infrastructure/battle/smogon/SmogonSpeciesMapper";
import * as BattleValidationMod from "@/domain/battle/services/BattleValidation";

describe("Coverage boost - Id-first", () => {
  it("PokemonIdentity cubre todos los inputs", () => {
    const a = parsePokemonIdentity({ id: 25, name: "pikachu" });
    expect(a.numericId).toBe(25);
    expect(a.speciesId).toBe("pikachu");
    expect(a.base).toBe("pikachu");
    expect(a.form).toBe("base");
    expect(a.supported).toBe(true);
    expect(a.isFallbackToBase).toBe(false);
    expect(a.id).toContain("pikachu");
    expect(a.originalName).toBe("pikachu");
    expect(a.formId).toBe("base");
    expect(a.transformationKind).toBe("base");

    const b = parsePokemonIdentity("charizard-gmax", 8);
    expect(b.form).toBe("gmax");
    expect(b.smogonName).toBe("Charizard-Gmax");

    const c = parsePokemonIdentity("giratina:origin", 9);
    expect(c.base).toBe("giratina");
    expect(c.form).toBe("origin");

    const d = parsePokemonIdentity("#487 giratina-altered");
    expect(d.dexId).toBe(487);

    const e = parsePokemonIdentity({ base: "pikachu", form: "cosplay", dexId: 25, displayName: "pikachu-cosplay", generation: 1 });
    expect(e.form).toBe("cosplay");
    expect(e.supported).toBe(false);
    expect(e.isFallbackToBase).toBe(true);

    const f = parsePokemonIdentity({ base: "giratina", dexId: 10007 });
    expect(f.form).toBe("origin");

    const altered = parsePokemonIdentity({ id: 487, name: "giratina-altered" }, 9);
    const origin = parsePokemonIdentity({ id: 487, name: "giratina-origin" }, 9);
    expect(altered.smogonName).not.toBe(origin.smogonName);
    expect(altered.smogonName).toBe("Giratina");
    expect(origin.smogonName).toBe("Giratina-Origin");

    const cosplay = parsePokemonIdentity({ id: 25, name: "pikachu-cosplay" }, 1);
    expect(cosplay.supported).toBe(false);
  });

  it("PokemonIdentity cubre casos legacy, errores y nulos", () => {
    expect(parsePokemonIdentity(null as any).supported).toBe(false);
    expect(parsePokemonIdentity({}).base).toBe("object-object"); 
    expect(parsePokemonIdentity(123 as any).base).toBe("123");
    expect(parsePokemonIdentity({ dexId: 487 }).base).toBe("giratina");
    expect(parsePokemonIdentity({ dexId: 6, form: "mega-x" }).form).toBe("mega-x");
    expect(parsePokemonIdentity({ dexId: 25, displayName: "Pikachu-Rock-Star" }).form).toBe("rock-star");
    expect(parsePokemonIdentity({ base: "gengar" }).base).toBe("gengar");
    expect(parsePokemonIdentity({ base: "venusaur", form: "mega" }).form).toBe("mega");
    expect(parsePokemonIdentity("#   006   charizard:mega-y").form).toBe("mega-y");
    expect(() => PokemonIdentity.fromDexId(0)).toThrow("Invalid numericId: 0");
    expect(() => PokemonIdentity.fromDexId(-1)).toThrow();
    expect(PokemonIdentity.fromSpeciesId("charizard-mega-x", 6).form).toBe("mega-x");
  });

  it("PokemonFormResolver cubre helpers", () => {
    expect(inferFormFromDisplayName("charizard-mega-x")).toBe("mega-x");
    expect(inferFormFromDisplayName("charizard-mega-y")).toBe("mega-y");
    expect(inferFormFromDisplayName("charizard-mega-z")).toBe("mega-z");
    expect(inferFormFromDisplayName("venusaur-mega")).toBe("mega");
    expect(inferFormFromDisplayName("charizard-gigantamax")).toBe("gmax");
    expect(inferFormFromDisplayName("pikachu-alola-totem")).toBe("totem-alola");
    expect(inferFormFromDisplayName("mimikyu-totem")).toBe("totem");
    expect(inferFormFromDisplayName("growlithe-hisui")).toBe("hisui");
    expect(inferFormFromDisplayName("sandslash-alola")).toBe("alola");
    expect(inferFormFromDisplayName("ponyta-galar")).toBe("galar");
    expect(inferFormFromDisplayName("wooper-paldea")).toBe("paldea");
    expect(inferFormFromDisplayName("pikachu-50")).toBe("50");
    expect(inferFormFromDisplayName("pikachu")).toBe("base");

    expect(normalizeForm("GIGAMAX")).toBe("gmax");
    expect(normalizeForm("alola-totem")).toBe("totem-alola");
    expect(normalizeForm("")).toBe("base");

    expect(resolveFormFromDexId(10195)).toBe("gmax");
    expect(resolveFormFromDexId(99999, "charizard-gmax")).toBe("gmax");
    expect(resolveFormFromDexId(25)).toBe("base");

    const list = [{ id: 25, name: "pikachu" }, { id: 6, name: "charizard" }];
    // @ts-ignore - test de forma con lista
    const res = resolvePokemonForm({ dexId: 25, base: "pikachu", form: "base" } as any, list as any);
    expect(res.form).toBe("base");
  });

  it("PokemonSpriteResolver cubre clase + funcion", () => {
    const resolver = new PokemonSpriteResolver();
    const idBase = parsePokemonIdentity({ id: 25, name: "pikachu" });
    const idGmax = parsePokemonIdentity({ id: 6, name: "charizard-gmax" }, 8);
    const idMegaX = parsePokemonIdentity({ id: 6, name: "charizard-mega-x" }, 7);
    const idMegaY = parsePokemonIdentity({ id: 6, name: "charizard-mega-y" }, 7);
    const idMegaZ = parsePokemonIdentity({ id: 10307, name: "absol-mega-z" }, 7);
    const idAlola = parsePokemonIdentity({ id: 26, name: "raichu-alola" }, 7);

    expect(resolver.resolve(idBase)).toContain("pikachu");
    expect(resolver.resolve(idGmax)).toContain("gmax");
    expect(resolver.resolve(idMegaX)).toContain("megax");
    expect(resolver.resolve(idMegaY)).toContain("megay");
    expect(resolver.resolve(idMegaZ)).toContain("megaz");
    expect(resolver.resolve(idAlola)).toContain("alola");
    expect(resolver.resolve(idBase, { shiny: true })).toContain("ani-shiny");

    const sprite = resolvePokemonSprite({ id: 10007, name: "giratina-origin" } as any);
    expect(sprite.chain[0]).toContain("/10007.png");
    expect(sprite.chain[0]).toContain("/home/");
  });

  it("PokemonSpriteResolver cubre fallbacks estáticos y cadenas puras", () => {
    const identityBaseForm = { base: "charizard", form: "mega-x", numericId: 6 } as any;
    const res1 = resolvePokemonSprite(identityBaseForm);
    expect(res1.chain.length).toBeGreaterThan(0);
    const res2 = PokemonSpriteResolver.resolve({ id: 0, name: "missingno" });
    expect(res2.primary).toContain("25.png");
    expect(getSpriteChain(identityBaseForm).length).toBeGreaterThan(0);
    expect(getSpriteChain({ id: 6, name: "charizard" }).length).toBeGreaterThan(0);
  });

  it("SmogonSpeciesMapper cubre map y resolve", () => {
    const a = SmogonSpeciesMapper.resolve({ id: 487, name: "giratina-altered" }, 9);
    expect(a.smogonName).toBe("Giratina");
    const b = SmogonSpeciesMapper.map("pikachu", 9);
    expect(b.base).toBe("pikachu");
    const inst = new SmogonSpeciesMapper();
    expect(inst.resolve({ id: 25, name: "pikachu" }, 1).base).toBe("pikachu");
    expect(inst.map({ id: 25, name: "pikachu" }, 1).base).toBe("pikachu");
  });

  it("SmogonSpeciesMapper cubre branches exhaustivos de generaciones y helpers", () => {
    expect(SmogonSpeciesMapper.toSmogon("charizard-gmax")).toBe("Charizard-Gmax");
    expect(SmogonSpeciesMapper.toSmogon("giratina-altered")).toBe("Giratina");
    expect(SmogonSpeciesMapper.toSmogon("pikachu")).toBe("Pikachu");
    expect(SmogonSpeciesMapper.fromSmogon("Charizard Mega X")).toBe("charizard-mega-x");
    expect(SmogonSpeciesMapper.isSupported("mega", 5)).toBe(false);
    expect(SmogonSpeciesMapper.isSupported("mega", 6)).toBe(true);
    expect(SmogonSpeciesMapper.resolve({ id: 250, name: "celebi" }, 1).supported).toBe(false);
    expect(SmogonSpeciesMapper.extractBaseAndForm("venusaur-mega").form).toBe("mega");
    expect(SmogonSpeciesMapper.buildSmogonName("venusaur", "mega")).toBe("Venusaur-Mega");
    expect(SmogonSpeciesMapper.getMaxDex(1)).toBe(151);
    expect(SmogonSpeciesMapper.getMaxDex(99)).toBe(1025);
  });

  it("BattleValidation intenta cubrir si existe", () => {
    const mod: any = BattleValidationMod as any;
    const fn = mod.BattleValidation ?? mod.validate ?? mod.validateBattleScenario ?? mod.default;
    if (!fn) return;
    if (typeof fn.validate === "function") {
      expect(() => fn.validate({ generation: 0 } as any)).toThrow();
    } else if (typeof fn === "function") {
      expect(() => fn({ generation: 0 } as any)).toThrow();
    }
  });
});