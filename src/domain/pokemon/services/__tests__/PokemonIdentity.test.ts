import { describe, it, expect } from "vitest";
import { parsePokemonIdentity } from "../../value-objects/PokemonIdentity";

describe("parsePokemonIdentity", () => {
  it("standard", () => {
    const id = parsePokemonIdentity({ id: 25, name: "pikachu" });
    expect(id.speciesId).toBe("pikachu");
    expect(id.formId).toBe("base");
  });
  it("mega zygarde", () => {
    const id = parsePokemonIdentity({ id: 10301, name: "zygarde-mega" });
    expect(id.speciesId).toBe("zygarde");
    expect(id.formId).toBe("mega");
  });
  it("mega-z absol", () => {
    const id = parsePokemonIdentity({ id: 10307, name: "absol-mega-z" });
    expect(id.speciesId).toBe("absol");
    expect(id.formId).toBe("mega-z");
  });
  it("gmax", () => {
    const id = parsePokemonIdentity({ id: 10032, name: "charizard-gmax" });
    expect(id.speciesId).toBe("charizard");
    expect(id.formId).toBe("gmax");
  });
});
