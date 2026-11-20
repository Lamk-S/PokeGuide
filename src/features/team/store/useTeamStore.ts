"use client";
import { z } from "zod";
import { create } from "zustand";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { Nature } from "@/domain/stats/types/StatTypes";
import type {
  BattleFormat,
  BattleRuleset,
} from "@/domain/team/config/battleFormat";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import { TeamLegalityValidator } from "@/domain/team/services/TeamLegalityValidator";
import type {
  BaseStats,
  CalculatedStats,
  EVSet,
  TeamAnalysis,
  TeamMember,
} from "@/domain/team/types/TeamTypes";
import { container } from "@/infrastructure/composition/container";

const natureSchema = z
  .object({
    name: z.string().min(1),
    nameEs: z.string().min(1),
    increasedStat: z.string().nullable(),
    decreasedStat: z.string().nullable(),
  })
  .strict();

const evSetSchema = z
  .object({
    hp: z.number().int().min(0).max(252),
    attack: z.number().int().min(0).max(252),
    defense: z.number().int().min(0).max(252),
    "special-attack": z.number().int().min(0).max(252),
    "special-defense": z.number().int().min(0).max(252),
    speed: z.number().int().min(0).max(252),
  })
  .strict()
  .refine(
    (evs) => (Object.values(evs) as number[]).reduce((a, b) => a + b, 0) <= 510,
  );

const ivSetSchema = z
  .object({
    hp: z.number().int().min(0).max(31),
    attack: z.number().int().min(0).max(31),
    defense: z.number().int().min(0).max(31),
    "special-attack": z.number().int().min(0).max(31),
    "special-defense": z.number().int().min(0).max(31),
    speed: z.number().int().min(0).max(31),
  })
  .strict();

const baseStatsSchema = z
  .object({
    hp: z.number().int().min(1).max(255),
    attack: z.number().int().min(1).max(255),
    defense: z.number().int().min(1).max(255),
    "special-attack": z.number().int().min(1).max(255),
    "special-defense": z.number().int().min(1).max(255),
    speed: z.number().int().min(1).max(255),
  })
  .strict();

const calculatedStatsSchema = z
  .object({
    hp: z.number().int().min(1),
    attack: z.number().int().min(1),
    defense: z.number().int().min(1),
    specialAttack: z.number().int().min(1),
    specialDefense: z.number().int().min(1),
    speed: z.number().int().min(1),
  })
  .strict();

export const teamMemberSchema = z
  .object({
    pokemonId: z.number().int().min(1),
    id: z.string().min(1),
    name: z.string().min(1),
    displayNameEs: z.string().min(1),
    species: z.string().min(1),
    types: z.array(z.string().min(1)).min(1).max(2),
    abilityId: z.string().nullable(),
    itemId: z.string().nullable(),
    ability: z.string().nullable(),
    item: z.string().nullable(),
    nature: natureSchema,
    level: z.number().int().min(1).max(100),
    evs: evSetSchema,
    ivs: ivSetSchema,
    calculatedStats: calculatedStatsSchema,
    baseStats: baseStatsSchema,
    moves: z.array(z.string().min(1)).max(4).default([]),
    teraType: z.string().nullable(),
    isTeraActive: z.boolean(),
  })
  .strict();

export interface LegalityIssue {
  readonly code: "SPECIES_CLAUSE" | "ITEM_CLAUSE";
  readonly message: string;
  readonly members: readonly string[];
}

function getRulesetForFormat(
  format: BattleFormat,
  base: BattleRuleset,
): BattleRuleset {
  const level = format === "smogon-ou" ? 100 : 50;
  return Object.freeze({
    ...base,
    id: format,
    format,
    level,
  }) as BattleRuleset;
}

async function runAnalysis(
  team: PokemonTeam,
  ruleset: BattleRuleset,
): Promise<TeamAnalysis | null> {
  try {
    await container.init();
    const useCase = container.getAnalyzeTeamUseCase();
    return await useCase.execute(team, ruleset);
  } catch {
    return null;
  }
}

function toValidatedMember(raw: unknown): TeamMember {
  const parsed = teamMemberSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`TeamMember inválido: ${issues}`);
  }
  const data = parsed.data;
  const nature = Object.freeze({ ...data.nature }) as Nature;
  const evs = Object.freeze({ ...data.evs }) as EVSet;
  const ivs = Object.freeze({ ...data.ivs }) as EVSet;
  const baseStats = Object.freeze({ ...data.baseStats }) as BaseStats;
  const calculatedStats = Object.freeze({
    ...data.calculatedStats,
  }) as CalculatedStats;
  const types = Object.freeze([...data.types]) as readonly PokemonType[];
  const moves = Object.freeze([...data.moves]) as readonly string[];

  return Object.freeze({
    id: data.id,
    pokemonId: data.pokemonId,
    name: data.name,
    displayNameEs: data.displayNameEs,
    species: data.species,
    types,
    abilityId: data.abilityId ? normalizeId(data.abilityId) : null,
    itemId: data.itemId ? normalizeId(data.itemId) : null,
    ability: data.ability,
    item: data.item,
    nature,
    level: data.level,
    evs,
    ivs,
    calculatedStats,
    baseStats,
    moves,
    teraType: data.teraType ? (data.teraType as PokemonType) : null,
    isTeraActive: data.isTeraActive,
  }) as TeamMember;
}

interface TeamStoreState {
  readonly team: PokemonTeam;
  readonly analysis: TeamAnalysis | null;
  readonly error: string | null;
  readonly legalityIssues: readonly LegalityIssue[];
  readonly ruleset: BattleRuleset;
  readonly setFormat: (format: BattleFormat) => Promise<void>;
  readonly addMember: (raw: unknown) => Promise<void>;
  readonly removeMember: (index: number) => Promise<void>;
  readonly replaceMember: (index: number, raw: unknown) => Promise<void>;
  readonly toggleTera: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStoreState>((set, get) => ({
  team: new PokemonTeam([]),
  analysis: null,
  error: null,
  legalityIssues: [],
  ruleset: DEFAULT_BATTLE_RULESET as BattleRuleset,
  setFormat: async (format) => {
    const newRuleset = getRulesetForFormat(format, get().ruleset);
    const currentTeam = get().team;
    const analysis =
      currentTeam.size > 0 ? await runAnalysis(currentTeam, newRuleset) : null;
    set({ ruleset: newRuleset, analysis, error: null });
  },
  addMember: async (raw: unknown) => {
    try {
      const member = toValidatedMember(raw);
      const currentTeam = get().team;
      const currentRuleset = get().ruleset;
      const nextTeam = currentTeam.addMember(member);
      const legality = TeamLegalityValidator.validate(nextTeam, currentRuleset);
      const critical = legality.issues.filter((i) => i.severity === "Critical");
      if (critical.length > 0) {
        const first = critical[0];
        set({
          error: first ? first.message : "Error de legalidad",
          legalityIssues: critical.map((i) => ({
            code:
              i.code === "species_clause" ? "SPECIES_CLAUSE" : "ITEM_CLAUSE",
            message: i.message,
            members: Object.freeze([...i.membersInvolved]),
          })),
        });
        return;
      }
      const analysis = await runAnalysis(nextTeam, currentRuleset);
      set({ team: nextTeam, analysis, error: null, legalityIssues: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error añadiendo" });
    }
  },
  removeMember: async (index: number) => {
    try {
      const { team, ruleset } = get();
      const nextTeam = team.removeMember(index);
      const analysis =
        nextTeam.size > 0 ? await runAnalysis(nextTeam, ruleset) : null;
      set({ team: nextTeam, analysis, error: null, legalityIssues: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error eliminando" });
    }
  },
  replaceMember: async (index: number, raw: unknown) => {
    try {
      const member = toValidatedMember(raw);
      const { team, ruleset } = get();
      const nextTeam = team.replaceMember(index, member);
      const legality = TeamLegalityValidator.validate(nextTeam, ruleset);
      const critical = legality.issues.filter((i) => i.severity === "Critical");
      if (critical.length > 0) {
        const first = critical[0];
        set({
          error: first ? first.message : "Error de legalidad",
          legalityIssues: critical.map((i) => ({
            code:
              i.code === "species_clause" ? "SPECIES_CLAUSE" : "ITEM_CLAUSE",
            message: i.message,
            members: Object.freeze([...i.membersInvolved]),
          })),
        });
        return;
      }
      const analysis = await runAnalysis(nextTeam, ruleset);
      set({ team: nextTeam, analysis, error: null, legalityIssues: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error reemplazando" });
    }
  },
  toggleTera: async (id: string) => {
    try {
      const { team, ruleset } = get();
      const nextTeam = team.toggleTera(id);
      const analysis = await runAnalysis(nextTeam, ruleset);
      set({ team: nextTeam, analysis, error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error toggle Tera" });
    }
  },
}));
