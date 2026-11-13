"use client";
import { z } from "zod";
import { create } from "zustand";
import { resolveBaseName } from "@/domain/pokemon/mappers/PokemonIdMapper";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import { PokemonTeam } from "@/domain/team/entities/PokemonTeam";
import {
  type MoveMeta,
  OffensiveAnalyzer,
} from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import type { TeamAnalysis, TeamMember } from "@/domain/team/types/TeamTypes";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";

interface ResolvedMove {
  readonly id: string;
}
type ExtendedMember = TeamMember & {
  readonly displayNameEs?: string;
  readonly itemId?: string | null;
  readonly item?: string | null;
};

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
    moves: z
      .array(
        z.union([
          z.string().min(1),
          z.object({ id: z.string().min(1) }).passthrough(),
        ]),
      )
      .max(4)
      .default([]),
    teraType: z.string().nullable().optional(),
    isTeraActive: z.boolean().optional(),
  })
  .strict();

export interface LegalityIssue {
  readonly code: "SPECIES_CLAUSE" | "ITEM_CLAUSE";
  readonly message: string;
  readonly members: readonly string[];
}

function extractMoveIdsFromMember(member: TeamMember): string[] {
  const moves = (
    member as unknown as { moves?: readonly (string | ResolvedMove)[] }
  ).moves;
  if (!moves) return [];
  return moves
    .map((m) => (typeof m === "string" ? m.toLowerCase() : m.id.toLowerCase()))
    .filter(Boolean);
}
function validateSpeciesClause(
  members: readonly TeamMember[],
): LegalityIssue | null {
  const seen = new Map<string, string[]>();
  for (const m of members) {
    const base = resolveBaseName(m.name.toLowerCase());
    const list = seen.get(base) ?? [];
    const ext = m as ExtendedMember;
    list.push(ext.displayNameEs ?? m.name);
    seen.set(base, list);
  }
  for (const [base, names] of seen) {
    if (names.length > 1)
      return {
        code: "SPECIES_CLAUSE",
        message: `Species Clause: ${base} duplicado (${names.join(", ")})`,
        members: names,
      };
  }
  return null;
}
function _validateItemClause(
  members: readonly TeamMember[],
): LegalityIssue | null {
  const seen = new Map<string, string[]>();
  for (const m of members) {
    const ext = m as ExtendedMember;
    const rawItem = ext.itemId ?? ext.item ?? "";
    const item = normalizeId(rawItem);
    if (!item) continue;
    const list = seen.get(item) ?? [];
    list.push(ext.displayNameEs ?? m.name);
    seen.set(item, list);
  }
  for (const [item, names] of seen) {
    if (names.length > 1)
      return {
        code: "ITEM_CLAUSE",
        message: `Item Clause: ${item} en ${names.join(", ")}`,
        members: names,
      };
  }
  return null;
}
interface TeamStoreState {
  readonly team: PokemonTeam;
  readonly analysis: TeamAnalysis | null;
  readonly error: string | null;
  readonly legalityIssues: readonly LegalityIssue[];
  readonly addMember: (raw: unknown) => Promise<void>;
  readonly removeMember: (index: number) => void;
  readonly replaceMember: (index: number, raw: unknown) => Promise<void>;
  readonly toggleTera: (id: string) => void;
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
  return Object.freeze({
    ...data,
    types: Object.freeze([...data.types]),
    moves: Object.freeze([
      ...(data.moves as readonly (string | ResolvedMove)[]),
    ]),
    evs: Object.freeze({ ...data.evs }),
    ivs: Object.freeze({ ...data.ivs }),
    baseStats: Object.freeze({ ...data.baseStats }),
    calculatedStats: Object.freeze({ ...data.calculatedStats }),
    nature: Object.freeze({ ...data.nature }),
  }) as unknown as TeamMember;
}

export const useTeamStore = create<TeamStoreState>((set, get) => ({
  team: new PokemonTeam([]),
  analysis: null,
  error: null,
  legalityIssues: [],
  addMember: async (raw: unknown) => {
    try {
      const member = toValidatedMember(raw);
      const nextTeam = get().team.addMember(member);
      const speciesIssue = validateSpeciesClause(
        nextTeam.getMembers() as readonly TeamMember[],
      );
      if (speciesIssue) {
        set({ error: speciesIssue.message, legalityIssues: [speciesIssue] });
        return;
      }
      const moveIds = nextTeam
        .getMembers()
        .flatMap((m) => extractMoveIdsFromMember(m as TeamMember));
      const moveMap = await LocalMoveRepository.getByIds(moveIds);
      const metaMap = new Map<string, MoveMeta>(
        [...moveMap.entries()].map(([id, dto]) => [
          id,
          { id: dto.id, type: dto.type as PokemonType, power: dto.power },
        ]),
      );
      const offensive = OffensiveAnalyzer.analyze(
        nextTeam.getMembers() as readonly TeamMember[],
        metaMap,
      );
      set({
        team: nextTeam,
        analysis: { offensiveCoverage: offensive } as unknown as TeamAnalysis,
        error: null,
        legalityIssues: [],
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error añadiendo" });
    }
  },
  removeMember: (index: number) => {
    try {
      const nextTeam = get().team.removeMember(index);
      set({ team: nextTeam, analysis: null, error: null, legalityIssues: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error eliminando" });
    }
  },
  replaceMember: async (index: number, raw: unknown) => {
    try {
      const member = toValidatedMember(raw);
      const nextTeam = get().team.replaceMember(index, member);
      const moveIds = nextTeam
        .getMembers()
        .flatMap((m) => extractMoveIdsFromMember(m as TeamMember));
      const moveMap = await LocalMoveRepository.getByIds(moveIds);
      const metaMap = new Map<string, MoveMeta>(
        [...moveMap.entries()].map(([id, dto]) => [
          id,
          { id: dto.id, type: dto.type as PokemonType, power: dto.power },
        ]),
      );
      const offensive = OffensiveAnalyzer.analyze(
        nextTeam.getMembers() as readonly TeamMember[],
        metaMap,
      );
      set({
        team: nextTeam,
        analysis: { offensiveCoverage: offensive } as unknown as TeamAnalysis,
        error: null,
        legalityIssues: [],
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error reemplazando" });
    }
  },
  toggleTera: (id: string) => {
    try {
      const currentTeam = get().team;
      const members = currentTeam.getMembers() as readonly TeamMember[];
      const idx = members.findIndex((m) => m.id === id);
      if (idx === -1) return;
      const target = members[idx];
      if (!target) return;
      const willActivate = !target.isTeraActive;
      const updatedMembers = members.map((m, i) => {
        if (i === idx) return { ...m, isTeraActive: willActivate };
        if (willActivate && m.isTeraActive)
          return { ...m, isTeraActive: false };
        return m;
      });
      let nextTeam = new PokemonTeam([]);
      for (const m of updatedMembers)
        nextTeam = nextTeam.addMember(m as TeamMember);
      set({ team: nextTeam, error: null });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Error toggle Tera" });
    }
  },
}));
