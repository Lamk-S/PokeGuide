import { describe, it, expect } from "vitest";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";

describe("PokemonSpriteResolver", () => {
  it("usa ID como identidad", () => {
    const identity = parsePokemonIdentity({ id: 10007, name: "giratina-origin" });
    const resolved = resolvePokemonSprite(identity);
    expect(resolved.chain[0]).toContain("/10007.png");
  });
});