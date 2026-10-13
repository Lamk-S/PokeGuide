import { describe, it, expect } from "vitest";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";

describe("PokemonIdentity", () => {
  it("parsea id y nombre como identidad", () => {
    const id = parsePokemonIdentity({ id: 487, name: "giratina-altered" });
    expect(id.numericId).toBe(487);
    expect(id.speciesId).toBe("giratina-altered");
  });
});