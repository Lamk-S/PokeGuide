import { describe, it, expect } from "vitest";
import { resolvePokemonSprite } from "../PokemonSpriteResolver";
import { parsePokemonIdentity } from "../../value-objects/PokemonIdentity";

describe("resolvePokemonSprite", () => {
  it("standard", () => {
    const id = parsePokemonIdentity({ id: 25, name: "pikachu" });
    const res = resolvePokemonSprite(id);
    expect(res.chain[0]).toContain("home/25.png");
  });
  it("mega zygarde", () => {
    const id = parsePokemonIdentity({ id: 10301, name: "zygarde-mega" });
    const res = resolvePokemonSprite(id);
    expect(res.chain[0]).toContain("10301");
  });
});
