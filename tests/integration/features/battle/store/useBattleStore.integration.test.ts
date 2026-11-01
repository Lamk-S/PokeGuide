import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBattleStore, type BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { Nature } from "@/domain/stats/types/StatTypes";

vi.mock("@/infrastructure/local-data/repositories/local-pokemon.repository", () => {
  return {
    LocalPokemonRepository: class {
      async init() {
        return;
      }
      async getById() {
        return {
          baseStats: {
            hp: 80,
            attack: 80,
            defense: 80,
            "special-attack": 80,
            "special-defense": 80,
            speed: 80,
          },
          stats: {
            hp: 80,
            attack: 80,
            defense: 80,
            "special-attack": 80,
            "special-defense": 80,
            speed: 80,
          },
          types: [{ type: { name: "normal" } }],
        };
      }
      async getPokemonById() {
        return {
          baseStats: {
            hp: 80,
            attack: 80,
            defense: 80,
            "special-attack": 80,
            "special-defense": 80,
            speed: 80,
          },
          types: [{ type: { name: "normal" } }],
        };
      }
    },
  };
});

const SERIOUS_NATURE: Nature = {
  name: "Serious",
  nameEs: "Seria",
  increasedStat: null,
  decreasedStat: null,
} as Nature;

function createTestInput(overrides: Partial<BattleParticipantInput> = {}): BattleParticipantInput {
  return {
    pokemonId: 25,
    name: "pikachu",
    level: 50,
    nature: SERIOUS_NATURE,
    evs: {
      hp: 0,
      attack: 0,
      defense: 0,
      "special-attack": 0,
      "special-defense": 0,
      speed: 0,
    },
    ivs: {
      hp: 31,
      attack: 31,
      defense: 31,
      "special-attack": 31,
      "special-defense": 31,
      speed: 31,
    },
    moves: ["tackle"],
    item: null,
    ability: null,
    status: "healthy",
    ...overrides,
  };
}

describe("useBattleStore.integration.test - Fase 4", () => {
  beforeEach(() => {
    useBattleStore.setState({
      attackerInput: null,
      defenderInput: null,
      attacker: null,
      defender: null,
      moveName: "",
      result: null,
      error: null,
      isCalculating: false,
      generation: 9,
      hasCalculatedOnce: false,
      autoCalculate: false,
      conditions: { weather: "none", terrain: "none" } as any,
    });
    vi.clearAllMocks();
  });

  it("interceptor de generaciones: item se limpia al pasar de Gen 9 a Gen 1", () => {
    const store = useBattleStore.getState();
    const attackerWithItem = createTestInput({
      pokemonId: 25,
      item: "life-orb",
    });

    store.setAttacker(attackerWithItem);
    useBattleStore.setState({ generation: 9 });

    expect(useBattleStore.getState().attackerInput?.item).toBe("life-orb");
    expect(useBattleStore.getState().generation).toBe(9);

    useBattleStore.getState().setGeneration(1);

    const afterGen1 = useBattleStore.getState();
    expect(afterGen1.generation).toBe(1);
    expect(afterGen1.attackerInput?.item).toBeNull();
    expect(afterGen1.defenderInput?.item ?? null).toBeNull();

    const attackerWithAbility = createTestInput({
      pokemonId: 25,
      item: "life-orb",
      ability: "static",
    });
    useBattleStore.getState().setAttacker(attackerWithAbility);
    useBattleStore.setState({ generation: 9 });
    useBattleStore.getState().setGeneration(2);
    expect(useBattleStore.getState().attackerInput?.ability).toBeNull();
  });

  it("interceptor Gen 1 limpia item tanto de atacante como defensor", () => {
    const attacker = createTestInput({ pokemonId: 6, item: "charizardite-x" });
    const defender = createTestInput({ pokemonId: 3, item: "assault-vest" });

    useBattleStore.getState().setAttacker(attacker);
    useBattleStore.getState().setDefender(defender);
    useBattleStore.setState({ generation: 9 });

    expect(useBattleStore.getState().attackerInput?.item).toBe("charizardite-x");
    expect(useBattleStore.getState().defenderInput?.item).toBe("assault-vest");

    useBattleStore.getState().setGeneration(1);

    expect(useBattleStore.getState().attackerInput?.item).toBeNull();
    expect(useBattleStore.getState().defenderInput?.item).toBeNull();
  });

  it("manejo de error FORM_NOT_AVAILABLE muestra mensaje amigable en español", async () => {
    const { LocalPokemonRepository } = (await import(
      "@/infrastructure/local-data/repositories/local-pokemon.repository"
    )) as any;

    const originalGetById = LocalPokemonRepository.prototype.getById;
    LocalPokemonRepository.prototype.getById = async () => {
      throw new Error("FORM_NOT_AVAILABLE: pikachu-cosplay is not available in gen 1");
    };

    const attacker = createTestInput({ pokemonId: 25, item: null });
    const defender = createTestInput({ pokemonId: 3, item: null });

    useBattleStore.setState({
      attackerInput: attacker,
      defenderInput: defender,
      attacker: attacker,
      defender: defender,
      moveName: "thunderbolt",
      generation: 1,
      hasCalculatedOnce: true,
    });

    try {
      await useBattleStore.getState().calculate();
      await new Promise((r) => setTimeout(r, 100));
      const state = useBattleStore.getState();
      expect(state.error).toBe(
        "El Pokémon o la forma seleccionada no está disponible en la generación elegida."
      );
      expect(state.result).toBeNull();
      expect(state.isCalculating).toBe(false);
    } finally {
      LocalPokemonRepository.prototype.getById = originalGetById;
    }
  });

  it("error de generación inválida muestra mensaje amigable", async () => {
    const { LocalPokemonRepository } = (await import(
      "@/infrastructure/local-data/repositories/local-pokemon.repository"
    )) as any;

    const originalGetById = LocalPokemonRepository.prototype.getById;
    LocalPokemonRepository.prototype.getById = async () => {
      throw new Error("Invalid generation 0");
    };

    const attacker = createTestInput({ pokemonId: 25 });
    const defender = createTestInput({ pokemonId: 3 });

    useBattleStore.setState({
      attackerInput: attacker,
      defenderInput: defender,
      attacker: attacker,
      defender: defender,
      moveName: "tackle",
      generation: 9,
      hasCalculatedOnce: true,
    });

    try {
      await useBattleStore.getState().calculate();
      await new Promise((r) => setTimeout(r, 150));
      const state = useBattleStore.getState();
      expect(state.error).toBe(
        "La generación seleccionada no es compatible con los datos actuales."
      );
    } finally {
      LocalPokemonRepository.prototype.getById = originalGetById;
    }
  });

  it("motor matemático aplica correctamente el multiplicador de Choice Band (Cinta Elegida)", async () => {
    const attackerWithoutItem = createTestInput({ pokemonId: 25, item: null });
    const defender = createTestInput({ pokemonId: 3, item: null });

    useBattleStore.setState({
      attackerInput: attackerWithoutItem,
      defenderInput: defender,
      attacker: attackerWithoutItem,
      defender: defender,
      moveName: "tackle",
      generation: 9,
      hasCalculatedOnce: true,
      autoCalculate: false,
    });

    await useBattleStore.getState().calculate();
    await new Promise((r) => setTimeout(r, 50));

    const resultWithoutItem = useBattleStore.getState().result;
    expect(resultWithoutItem).not.toBeNull();
    const damageWithoutItem = resultWithoutItem!.damage.minDamage;

    const attackerWithItem = createTestInput({ pokemonId: 25, item: "choice-band" });

    useBattleStore.setState({
      attackerInput: attackerWithItem,
      attacker: attackerWithItem,
    });

    await useBattleStore.getState().calculate();
    await new Promise((r) => setTimeout(r, 50));

    const resultWithItem = useBattleStore.getState().result;
    expect(resultWithItem).not.toBeNull();
    const damageWithItem = resultWithItem!.damage.minDamage;

    expect(damageWithItem).toBeGreaterThan(damageWithoutItem);
    const expectedRatio = damageWithItem / damageWithoutItem;
    expect(expectedRatio).toBeGreaterThanOrEqual(1.4);
  });
});
