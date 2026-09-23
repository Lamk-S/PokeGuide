export interface BattleContext {
  generation: number | "latest";
  ruleset: string;
  allowMegaEvolution: boolean;
  allowGigantamax: boolean;
  allowZMoves?: boolean;
}

export const DEFAULT_BATTLE_CONTEXT: BattleContext = {
  generation: "latest",
  ruleset: "gen9ou",
  allowMegaEvolution: true,
  allowGigantamax: true,
  allowZMoves: true,
};

export function resolveBattleContext(
  generation: number | string | "latest",
  overrides?: Partial<BattleContext>,
): BattleContext {
  let gen: number | "latest" = "latest";

  if (typeof generation === "number") {
    gen = generation;
  } else if (typeof generation === "string" && generation !== "latest") {
    const parsed = Number.parseInt(generation, 10);
    gen = Number.isNaN(parsed) ? "latest" : parsed;
  }

  return {
    ...DEFAULT_BATTLE_CONTEXT,
    generation: gen,
    ...overrides,
  };
}
