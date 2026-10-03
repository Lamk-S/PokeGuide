import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { TeamMember } from "@/domain/team/types/TeamTypes";

function createMockMember(input: {
  id: string;
  name: string;
  types: PokemonType[];
  speed: number;
}): TeamMember {
  return {
    id: input.id,
    name: input.name,
    species: input.name,
    types: input.types,
    calculatedStats: {
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: input.speed,
      spAttack: 100,
      spDefense: 100,
    },
  } as unknown as TeamMember;
}

export const MOCK_POOL: TeamMember[] = [
  createMockMember({
    id: "garchomp",
    name: "Garchomp",
    types: ["dragon", "ground"],
    speed: 102,
  }),
  createMockMember({
    id: "ferrothorn",
    name: "Ferrothorn",
    types: ["grass", "steel"],
    speed: 20,
  }),
  createMockMember({
    id: "dragapult",
    name: "Dragapult",
    types: ["dragon", "ghost"],
    speed: 142,
  }),
  createMockMember({
    id: "corviknight",
    name: "Corviknight",
    types: ["flying", "steel"],
    speed: 67,
  }),
  createMockMember({
    id: "heatran",
    name: "Heatran",
    types: ["fire", "steel"],
    speed: 77,
  }),
  createMockMember({
    id: "toxapex",
    name: "Toxapex",
    types: ["poison", "water"],
    speed: 35,
  }),
  createMockMember({
    id: "weavile",
    name: "Weavile",
    types: ["dark", "ice"],
    speed: 125,
  }),
  createMockMember({
    id: "rotom-w",
    name: "Rotom-Wash",
    types: ["electric", "water"],
    speed: 86,
  }),
  createMockMember({
    id: "clefable",
    name: "Clefable",
    types: ["fairy"],
    speed: 60,
  }),
  createMockMember({
    id: "landorus",
    name: "Landorus-T",
    types: ["ground", "flying"],
    speed: 91,
  }),
  createMockMember({
    id: "tyranitar",
    name: "Tyranitar",
    types: ["rock", "dark"],
    speed: 61,
  }),
  createMockMember({
    id: "gholdengo",
    name: "Gholdengo",
    types: ["steel", "ghost"],
    speed: 84,
  }),
];
