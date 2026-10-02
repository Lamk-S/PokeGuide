"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTeamStore } from "../store/useTeamStore";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { TeamMember } from "@/domain/team/types/TeamTypes";

type MemberWithMeta = TeamMember & {
  readonly name?: string;
  readonly species?: string;
  readonly id?: string;
};

function getMemberName(member: TeamMember): string {
  const meta = member as unknown as MemberWithMeta;
  return meta.name ?? meta.species ?? meta.id ?? "Desconocido";
}

const TYPE_DOT: Record<string, string> = {
  normal: "bg-[#A8A29E]",
  fire: "bg-[#F97316]",
  water: "bg-[#3B82F6]",
  electric: "bg-[#EAB308]",
  grass: "bg-[#22C55E]",
  ice: "bg-[#06B6D4]",
  fighting: "bg-[#EF4444]",
  poison: "bg-[#A855F7]",
  ground: "bg-[#D97706]",
  flying: "bg-[#6366F1]",
  psychic: "bg-[#EC4899]",
  bug: "bg-[#84CC16]",
  rock: "bg-[#A8A29E]",
  ghost: "bg-[#8B5CF6]",
  dragon: "bg-[#7C3AED]",
  dark: "bg-[#57534E]",
  steel: "bg-[#71717A]",
  fairy: "bg-[#F472B6]",
};

export function TypeExposureMatrix() {
  const team = useTeamStore((s) => s.team);
  const analysis = useTeamStore((s) => s.analysis);
  const members = team.getMembers();

  const [hoveredType, setHoveredType] = useState<PokemonType | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  if (members.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[20px] border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(400px_at_50%_0%,rgba(217,59,50,0.06),transparent)]" />
        <div className="relative">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#EDE8E0] bg-white text-[16px]">
            ◑
          </div>
          <h3 className="mt-3 font-serif text-[14px] font-semibold text-zinc-900">
            Matriz defensiva inactiva
          </h3>
          <p className="mx-auto mt-1.5 max-w-80 text-[11px] leading-normal text-zinc-500">
            Añade al menos 1 Pokémon para ver cuántos miembros son débiles,
            resisten o son inmunes a cada tipo. 18 filas, lectura rápida sin
            ruido.
          </p>
          <div className="mx-auto mt-4 grid max-w-70 grid-cols-3 gap-1.5 text-[10px]">
            <div className="rounded-[8px] bg-white border border-[#EDE8E0] py-1.5">
              Débil
            </div>
            <div className="rounded-[8px] bg-white border border-[#EDE8E0] py-1.5">
              Resiste
            </div>
            <div className="rounded-[8px] bg-zinc-900 text-white py-1.5">
              Inmune
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const coverage = analysis.defensiveCoverage;

  const criticalTypes = ALL_POKEMON_TYPES.filter((t) => {
    const exp = coverage[t];
    return exp.weak >= 3 && exp.resist + exp.immune <= 1;
  });

  const getWeakMembers = (atk: PokemonType) => {
    return members.filter(
      (m) => TypeEffectiveness.getMultiplier(atk, m.types) > 1,
    );
  };

  const mostWeak = [...ALL_POKEMON_TYPES].sort(
    (a, b) => coverage[b].weak - coverage[a].weak,
  )[0];
  const mostWeakCount = mostWeak ? coverage[mostWeak].weak : 0;

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#EDE8E0] bg-white">
      <div className="flex items-start justify-between border-b border-[#F0EDE6] px-5 py-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
            Matriz de Exposición Defensiva
          </h3>
          <p className="mt-1 max-w-105 text-[11px] leading-normal text-zinc-500">
            Densa y explicable. Cada celda muestra cuántos miembros son débiles,
            resisten o son inmunes. Diseñada para lectura rápida sin ruido
            visual.
          </p>
        </div>
        {criticalTypes.length > 0 && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-600">
            {criticalTypes.length} tipos críticos
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#F0EDE6] bg-[#FCFBF8] text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              <th className="px-4 py-2.5 font-semibold">Tipo Ato</th>
              <th className="px-3 py-2.5 text-center font-semibold">Débil</th>
              <th className="px-3 py-2.5 text-center font-semibold">Resiste</th>
              <th className="px-3 py-2.5 text-center font-semibold">Inmune</th>
              <th className="px-3 py-2.5 text-center font-semibold">Neutro</th>
              <th className="px-4 py-2.5 font-semibold">Cobertura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F1E8]">
            {ALL_POKEMON_TYPES.map((atk) => {
              const exp = coverage[atk];
              const isCritical = exp.weak >= 3 && exp.resist + exp.immune <= 1;
              const coveragePct = Math.round(
                ((exp.resist + exp.immune) / Math.max(1, members.length)) * 100,
              );
              const dots = 5;
              const filled = Math.min(
                dots,
                Math.max(0, exp.resist + exp.immune),
              );

              return (
                <tr
                  key={atk}
                  className={`group transition-colors hover:bg-[#FCFBF8] ${isCritical ? "bg-red-50/40" : ""}`}
                  onMouseEnter={(e) => {
                    setHoveredType(atk);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHoveredType(null)}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-1.5 rounded-full ${TYPE_DOT[atk] ?? "bg-zinc-400"}`}
                      />
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isCritical ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-600"}`}
                      >
                        {atk}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-[12px] tabular-nums ${exp.weak > 0 ? "bg-[#FEE2E2] font-bold text-[#991B1B]" : "text-zinc-300"}`}
                    >
                      {exp.weak}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-[12px] tabular-nums ${exp.resist > 0 ? "bg-[#DCFCE7] font-semibold text-[#166534]" : "text-zinc-300"}`}
                    >
                      {exp.resist}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-[12px] tabular-nums ${exp.immune > 0 ? "bg-zinc-900 text-white" : "text-zinc-300"}`}
                    >
                      {exp.immune}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-[12px] tabular-nums text-zinc-400">
                    {exp.neutral}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {(["a", "b", "c", "d", "e"] as const)
                          .slice(0, dots)
                          .map((letter, idx) => (
                            <div
                              key={`${atk}-${letter}`}
                              className={`size-1.5 rounded-full ${idx < filled ? "bg-zinc-900" : "bg-zinc-200"}`}
                            />
                          ))}
                      </div>
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {coveragePct}% cubierto
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mostWeakCount >= 3 && mostWeak && (
        <div className="m-3 flex gap-2 rounded-[10px] bg-[#FFFBEB] p-3">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-white">
            !
          </div>
          <p className="text-[11px] leading-normal text-zinc-700">
            <span className="font-semibold">Nota táctica:</span> {mostWeakCount}{" "}
            de {members.length} miembros comparten debilidad a{" "}
            {mostWeak.charAt(0).toUpperCase() + mostWeak.slice(1)}. Considera
            cambiar Gengar por un tipo Fantasma/Acero para cerrar el hueco sin
            perder momentum.
          </p>
        </div>
      )}

      {hoveredType &&
        tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 max-w-60 rounded-[10px] border border-zinc-200 bg-zinc-900 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {hoveredType} → débiles
            </div>
            <div className="mt-1 text-[12px] leading-normal text-white">
              {getWeakMembers(hoveredType).length === 0
                ? "Ningún miembro es débil"
                : getWeakMembers(hoveredType)
                    .map((m) => getMemberName(m))
                    .join(", ")}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
