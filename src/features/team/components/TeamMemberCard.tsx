"use client";

import { useState, useMemo } from "react";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { resolvePokemonNumericId } from "@/domain/pokemon/mappers/PokemonIdMapper";
import { translateTypeToSpanish } from "@/features/team/constants/typeTranslations";
import { translateItemToSpanish } from "@/features/team/constants/competitiveItems";
import { translateAbilityToSpanish } from "@/features/team/constants/competitiveAbilities";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import { useTeamStore } from "../store/useTeamStore";
import { EditMemberModal } from "./EditMemberModal";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly displayNameEs?: string;
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
  return meta.displayNameEs ?? meta.name ?? meta.species ?? "Desconocido";
}

function getRawName(member: TeamMember): string {
  const meta = member as MemberWithMeta;
  return (meta.name ?? meta.species ?? "unknown").toLowerCase();
}

function useDefensiveMetrics(member: TeamMember) {
  return useMemo(() => {
    let resistCount = 0;
    let immuneCount = 0;
    for (const atk of ALL_POKEMON_TYPES) {
      const mult = TypeEffectiveness.getMultiplier(
        atk,
        member.types as readonly PokemonType[],
        member.abilityId ?? member.ability ?? null,
        member.itemId ?? member.item ?? null,
      );
      if (mult < 1 && mult > 0) resistCount += 1;
      if (mult === 0) immuneCount += 1;
    }
    const total = ALL_POKEMON_TYPES.length;
    const cobertura = Math.round(((resistCount + immuneCount) / total) * 100);
    return { resistCount, immuneCount, cobertura };
  }, [member]);
}

function useTeamCoverage(members: readonly TeamMember[], upToIndex: number) {
  return useMemo(() => {
    const slice = members.slice(0, upToIndex + 1);
    if (slice.length === 0) return 0;
    let covered = 0;
    for (const atk of ALL_POKEMON_TYPES) {
      const hasResist = slice.some((m) => {
        const mult = TypeEffectiveness.getMultiplier(
          atk,
          m.types as readonly PokemonType[],
          m.abilityId ?? m.ability ?? null,
          m.itemId ?? m.item ?? null,
        );
        return mult < 1;
      });
      if (hasResist) covered += 1;
    }
    return Math.round((covered / ALL_POKEMON_TYPES.length) * 100);
  }, [members, upToIndex]);
}

export function TeamMemberCard({ member, index, onRemove, onReplace }: Props) {
  const displayName = getDisplayName(member);
  const rawName = getRawName(member);
  const numericId = resolvePokemonNumericId(member);
  const team = useTeamStore((s) => s.team);
  const members = team.getMembers();
  const replaceMember = useTeamStore((s) => s.replaceMember);
  const [editOpen, setEditOpen] = useState(false);

  const { cobertura, resistCount, immuneCount } = useDefensiveMetrics(member);
  const teamCoverage = useTeamCoverage(members, index);

  const stats = member.calculatedStats;
  const bestStat: keyof typeof stats = useMemo(() => {
    const entries: [keyof typeof stats, number][] = [
      ["hp", stats.hp ?? 0],
      ["attack", stats.attack ?? 0],
      ["defense", stats.defense ?? 0],
      ["specialAttack", stats.specialAttack ?? 0],
      ["specialDefense", stats.specialDefense ?? 0],
      ["speed", stats.speed ?? 0],
    ];
    let best: keyof typeof stats = "hp";
    let bestVal = -1;
    for (const [k, v] of entries) {
      if (v > bestVal) {
        bestVal = v;
        best = k;
      }
    }
    return best;
  }, [stats]);

  const evTotal = useMemo(
    () => Object.values(member.evs).reduce((a, b) => a + b, 0),
    [member.evs],
  );
  const natureLabel = member.nature
    ? `${member.nature.nameEs} · ${member.nature.name}`
    : "Neutro";

  return (
    <>
      <div className="flex h-full w-full flex-col bg-white p-4 sm:p-5">
        {/* Identidad */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center bg-[#F8F5F0] sm:h-16 sm:w-16">
              <PokemonSprite
                pokemon={{ id: numericId, name: rawName }}
                size={44}
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 border border-[#EDE8E0] bg-white px-1 py-0.5 font-mono text-[9px] tabular-nums text-zinc-600">
              #{String(numericId).padStart(3, "0")}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-[15px] font-semibold leading-tight tracking-[-0.02em] text-[#111] sm:text-[16px]">
              {displayName}
            </h3>
            <div className="mt-1 flex flex-wrap gap-1">
              {member.types.map((t: PokemonType) => (
                <span
                  key={t}
                  className="border border-[#EDE8E0] bg-white px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-zinc-700"
                >
                  {translateTypeToSpanish(t)}
                </span>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] tabular-nums text-zinc-500">
              <span className="whitespace-nowrap">Nv. {member.level}</span>
              <span className="h-2 w-px shrink-0 bg-[#EDE8E0]" aria-hidden />
              <span className="truncate whitespace-nowrap" title={natureLabel}>
                {natureLabel}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="border border-[#EDE8E0] bg-white px-2 py-1 text-[10px] text-zinc-600 hover:border-[#111] hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              aria-label={`Ajustar ${displayName}`}
            >
              Ajustar
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-2 py-1 text-[10px] text-zinc-400 hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              aria-label={`Quitar ${displayName}`}
            >
              Quitar
            </button>
          </div>
        </div>

        {/* Configuración */}
        <div className="mt-4 min-h-13 border-t border-[#F5F1E8] pt-3">
          <div className="flex items-center justify-between">
            <div className="text-[9px] uppercase tracking-widest text-zinc-500">
              Configuración
            </div>
            <div className="text-[9px] tabular-nums text-zinc-400">
              {evTotal}/510
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {member.abilityId || member.ability ? (
              <span className="inline-flex max-w-27.5 truncate items-center gap-1 border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-800">
                <span
                  className="h-1 w-1 shrink-0 rounded-full bg-violet-600"
                  aria-hidden
                />
                <span className="truncate">
                  {translateAbilityToSpanish(
                    member.abilityId ?? member.ability ?? "",
                  )}
                </span>
              </span>
            ) : (
              <span className="border border-dashed border-[#EDE8E0] px-1.5 py-0.5 text-[10px] text-zinc-400">
                Sin habilidad
              </span>
            )}
            {member.itemId || member.item ? (
              <span className="inline-flex max-w-27.5 truncate items-center gap-1 border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-900">
                <span
                  className="h-1 w-1 shrink-0 rounded-full bg-amber-600"
                  aria-hidden
                />
                <span className="truncate">
                  {translateItemToSpanish(member.itemId ?? member.item ?? "")}
                </span>
              </span>
            ) : (
              <span className="border border-dashed border-[#EDE8E0] px-1.5 py-0.5 text-[10px] text-zinc-400">
                Sin objeto
              </span>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-3 flex-1">
          <div className="text-[9px] uppercase tracking-widest text-zinc-500">
            Estadísticas · Nv. {member.level}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-px border border-[#EDE8E0] bg-[#EDE8E0]">
            {[
              { k: "hp", label: "PS", v: stats.hp ?? 0 },
              { k: "attack", label: "ATQ", v: stats.attack ?? 0 },
              { k: "defense", label: "DEF", v: stats.defense ?? 0 },
              {
                k: "specialAttack",
                label: "AT. ESP.",
                v: stats.specialAttack ?? 0,
              },
              {
                k: "specialDefense",
                label: "DEF. ESP.",
                v: stats.specialDefense ?? 0,
              },
              { k: "speed", label: "VEL", v: stats.speed ?? 0 },
            ].map((cell) => {
              const isBest = cell.k === bestStat;
              return (
                <div
                  key={cell.k}
                  className={`flex min-h-11 flex-col justify-center bg-white px-2 py-1.5 ${isBest ? "bg-[#111]! text-white!" : ""}`}
                >
                  <div
                    className={`text-[8px] uppercase tracking-widest ${isBest ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {cell.label}
                  </div>
                  <div
                    className={`mt-0.5 font-serif text-[13px] font-semibold tabular-nums leading-none ${isBest ? "text-white" : "text-[#111]"}`}
                  >
                    {cell.v || 0}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500">
            <span className="truncate">Mejor: {bestStat}</span>
            {(member.itemId?.includes("scarf") ||
              member.item?.includes("scarf")) && (
              <span className="shrink-0 bg-[#111] px-1 py-0.5 text-[8px] text-white">
                ×1.5 VEL
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 border-t border-[#F5F1E8] pt-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-1 w-10 shrink-0 bg-[#EDE8E0] sm:w-12">
                <div
                  className="h-1 bg-[#111] transition-all"
                  style={{ width: `${teamCoverage}%` }}
                />
              </div>
              <span className="truncate text-[10px] tabular-nums text-zinc-600">
                Equipo {teamCoverage}% · Ind. {cobertura}%
              </span>
            </div>
            <button
              type="button"
              onClick={() => onReplace(index)}
              className="shrink-0 text-[10px] text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-[#111] hover:decoration-[#111]"
            >
              Reemplazar
            </button>
          </div>
          <div className="mt-1.5 truncate text-[9px] leading-[1.3] text-zinc-500">
            {resistCount} res. · {immuneCount} inm. ·{" "}
            {ALL_POKEMON_TYPES.length - resistCount - immuneCount} neutro/débil
          </div>
        </div>
      </div>

      <EditMemberModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        member={member}
        index={index}
        onSave={replaceMember}
      />
    </>
  );
}
