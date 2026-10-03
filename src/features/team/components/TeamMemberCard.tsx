"use client";

import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { resolvePokemonNumericId } from "@/domain/pokemon/mappers/PokemonIdMapper";
import { translateTypeToSpanish } from "@/features/team/constants/typeTranslations";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import { useTeamStore } from "../store/useTeamStore";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
};

interface Props {
  readonly member: TeamMember;
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onReplace: (index: number) => void;
}

function getDisplayName(member: TeamMember): string {
  const meta = member as MemberWithMeta;
  return meta.name ?? meta.species ?? "Desconocido";
}

function getRawName(member: TeamMember): string {
  const meta = member as MemberWithMeta;
  return (meta.name ?? meta.species ?? "unknown").toLowerCase();
}

function getStats(member: TeamMember) {
  const s = member.calculatedStats as unknown as Record<string, number>;
  return {
    hp: s.hp ?? 80,
    atk: s.attack ?? s.atk ?? 100,
    def: s.defense ?? s.def ?? 100,
    spa: s.specialAttack ?? s.spAttack ?? 100,
    spd: s.specialDefense ?? s.spDefense ?? 100,
    spe: s.speed ?? 100,
  };
}

type StatKey = "hp" | "atk" | "def" | "spa" | "spd" | "spe";

function getBestStatKey(stats: ReturnType<typeof getStats>): StatKey {
  const entries: [StatKey, number][] = [
    ["hp", stats.hp],
    ["atk", stats.atk],
    ["def", stats.def],
    ["spa", stats.spa],
    ["spd", stats.spd],
    ["spe", stats.spe],
  ];
  let best: StatKey = "hp";
  let bestVal = -1;
  for (const [key, val] of entries) {
    if (val >= bestVal) {
      bestVal = val;
      best = key;
    }
  }
  return best;
}

function calculateIndividualDefensiveCoverage(
  types: readonly PokemonType[],
): number {
  let resistCount = 0;
  for (const atk of ALL_POKEMON_TYPES) {
    const mult = TypeEffectiveness.getMultiplier(atk, types);
    if (mult < 1) resistCount++;
  }
  return Math.round((resistCount / ALL_POKEMON_TYPES.length) * 100);
}

function calculateTeamCoverageUpTo(
  members: readonly TeamMember[],
  upToIndex: number,
): number {
  const slice = members.slice(0, upToIndex + 1);
  if (slice.length === 0) return 0;
  let covered = 0;
  for (const atk of ALL_POKEMON_TYPES) {
    const hasResist = slice.some((m) => {
      const mult = TypeEffectiveness.getMultiplier(
        atk,
        m.types as readonly PokemonType[],
      );
      return mult < 1;
    });
    if (hasResist) covered++;
  }
  return Math.round((covered / ALL_POKEMON_TYPES.length) * 100);
}

export function TeamMemberCard({ member, index, onRemove, onReplace }: Props) {
  const displayName = getDisplayName(member);
  const rawName = getRawName(member);
  const numericId = resolvePokemonNumericId(member);
  const stats = getStats(member);
  const bestKey = getBestStatKey(stats);

  const team = useTeamStore((s) => s.team);
  const members = team.getMembers();

  const teamCoverage = calculateTeamCoverageUpTo(members, index);
  const individualCoverage = calculateIndividualDefensiveCoverage(
    member.types as readonly PokemonType[],
  );

  const statCells: { key: StatKey; label: string; value: number }[] = [
    { key: "hp", label: "PS", value: stats.hp },
    { key: "atk", label: "ATQ", value: stats.atk },
    { key: "def", label: "DEF", value: stats.def },
    { key: "spa", label: "ATE", value: stats.spa },
    { key: "spd", label: "DFE", value: stats.spd },
    { key: "spe", label: "VEL", value: stats.spe },
  ];

  return (
    <div className="group relative flex flex-col rounded-[16px] border border-zinc-200 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-3">
        <div className="relative flex size-16 shrink-0 items-center justify-center rounded-[12px] bg-[#F8F5F0]">
          <PokemonSprite pokemon={{ id: numericId, name: rawName }} size={52} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-mono font-medium tabular-nums text-zinc-600 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            #{String(numericId).padStart(3, "0")}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[15px] font-semibold leading-tight tracking-[-0.01em] text-zinc-900">
            {displayName}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {member.types.map((t: PokemonType) => (
              <span
                key={t}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{
                  background: t === member.types[0] ? "#111" : "#F1F0EE",
                  color: t === member.types[0] ? "white" : "#6B6560",
                }}
              >
                {translateTypeToSpanish(t)}
              </span>
            ))}
          </div>
          <div className="mt-1.5 text-[11px] tabular-nums text-zinc-500">
            NV. 50 · INDIVIDUAL · {individualCoverage}% resistencia
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label={`Quitar ${displayName}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <title>Quitar</title>
            <path
              d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-6 overflow-hidden rounded-[10px] border border-zinc-200">
        {statCells.map((cell) => {
          const isBest = cell.key === bestKey;
          return (
            <div
              key={cell.key}
              className={`flex flex-col items-center border-r border-zinc-200 py-2 last:border-r-0 ${isBest ? "bg-zinc-900" : "bg-white"}`}
            >
              <span
                className={`text-[10px] font-medium uppercase tracking-wide ${isBest ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {cell.label}
              </span>
              <span
                className={`mt-0.5 text-[13px] font-bold tabular-nums ${isBest ? "text-white" : "text-zinc-900"}`}
              >
                {cell.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-900 transition-all"
              style={{ width: `${teamCoverage}%` }}
            />
          </div>
          <span
            className="text-[11px] tabular-nums text-zinc-500"
            title={`Individual: ${individualCoverage}% tipos resistidos. Equipo hasta aquí: ${teamCoverage}%`}
          >
            Cobertura {teamCoverage}%
          </span>
        </div>

        <button
          type="button"
          onClick={() => onReplace(index)}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
        >
          Reemplazar
        </button>
      </div>
    </div>
  );
}
