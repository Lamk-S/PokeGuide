import { describe, it, expect } from "vitest";
import { resolvePokemonMovesSync } from "@/domain/pokemon/services/PokemonMoveResolver";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";

describe("PokemonMoveResolver", () => {
  it("resuelve movimientos con fallback", () => {
    const identity = parsePokemonIdentity(25, "pikachu");
    const result = resolvePokemonMovesSync(identity, [{ id: 25, name: "pikachu", moves: [{ name: "thunderbolt" }] }] as never);
    expect(result.moves.length).toBeGreaterThan(0);
  });
});
