import { describe, it, expect } from "vitest";
import { resolvePokemonMovesSync } from "../PokemonMoveResolver";
import { parsePokemonIdentity } from "../../value-objects/PokemonIdentity";

const mockList = [
  {
    name: "absol",
    moves: [
      { name: "swords-dance" },
      { name: "sucker-punch" },
      { name: "knock-off" },
      { name: "play-rough" },
      { name: "fire-blast" },
      { name: "ice-beam" },
    ],
  },
  { name: "absol-mega", moves: [] as Array<{ name: string }> },
  { name: "absol-mega-z", moves: [] as Array<{ name: string }> },
  {
    name: "zygarde-50",
    moves: [
      { name: "thousand-arrows" },
      { name: "outrage" },
      { name: "extreme-speed" },
      { name: "coil" },
    ],
  },
  { name: "zygarde-mega", moves: [] as Array<{ name: string }> },
  {
    name: "charizard",
    moves: [{ name: "flamethrower" }, { name: "air-slash" }],
  },
  { name: "charizard-gmax", moves: [] as Array<{ name: string }> },
];

describe("resolvePokemonMoves", () => {
  it("inherits mega-z", () => {
    const id = parsePokemonIdentity({ id: 10307, name: "absol-mega-z" });
    const res = resolvePokemonMovesSync(id, mockList);
    expect(res.moves.length).toBeGreaterThan(0);
    expect(res.inheritedFrom).toBe("absol");
  });
  it("inherits zygarde-mega", () => {
    const id = parsePokemonIdentity({ id: 10301, name: "zygarde-mega" });
    const res = resolvePokemonMovesSync(id, mockList);
    expect(res.moves).toContain("thousand-arrows");
  });
});
