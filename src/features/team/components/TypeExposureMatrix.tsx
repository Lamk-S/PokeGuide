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

function getMemberStableId(member: TeamMember, idx: number): string {
  const meta = member as unknown as MemberWithMeta;
  const baseId = meta.id ?? meta.name ?? "member";
  return `member-${idx}-${baseId}`;
}

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
      <div className="rounded-[12px] border border-zinc-200 bg-zinc-50 p-8 text-center">
        <p className="font-serif text-[13px] text-zinc-500">
          Agrega Pokémon para ver la matriz defensiva
        </p>
      </div>
    );
  }

  if (!analysis) return null;

  const coverage = analysis.defensiveCoverage;

  const getWeakMembers = (atk: PokemonType) => {
    return members.filter(
      (m) => TypeEffectiveness.getMultiplier(atk, m.types) > 1,
    );
  };

  return (
    <div className="overflow-hidden rounded-[12px] border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h3 className="font-serif text-[14px] font-semibold tracking-[-0.01em] text-zinc-900">
          Matriz de Exposición Defensiva
        </h3>
        <p className="mt-1 text-[11px] leading-[1.4] text-zinc-500">
          Densa y explicable. Cada fila = tipo atacante. Columnas = cuántos de
          tu equipo reciben daño súper-efectivo, resistente o nulo.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-2.5 font-medium">Tipo Atq</th>
              <th className="px-3 py-2.5 text-center font-medium">Débil</th>
              <th className="px-3 py-2.5 text-center font-medium">Resiste</th>
              <th className="px-3 py-2.5 text-center font-medium">Inmune</th>
              <th className="px-3 py-2.5 text-center font-medium">Neutro</th>
              <th className="px-4 py-2.5 font-medium">Cobertura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {ALL_POKEMON_TYPES.map((atk) => {
              const exp = coverage[atk];
              const isCritical = exp.weak >= 3 && exp.resist + exp.immune <= 1;
              const isHigh =
                exp.weak >= 2 && exp.resist === 1 && exp.immune === 0;

              return (
                <tr
                  key={atk}
                  className={`group transition-colors hover:bg-zinc-50 ${isCritical ? "bg-red-50/40" : ""}`}
                  onMouseEnter={(e) => {
                    setHoveredType(atk);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHoveredType(null)}
                >
                  <td className="px-4 py-2.25">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex min-w-14 rounded-[6px] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${isCritical ? "bg-red-600 text-white" : "bg-zinc-900 text-white"}`}
                      >
                        {atk}
                      </span>
                      {isCritical && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                      )}
                      {isHigh && !isCritical && (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-3 py-2.25 text-center text-[12px] tabular-nums ${exp.weak > 0 ? "font-[650] text-zinc-900" : "text-zinc-400"}`}
                  >
                    {exp.weak}
                  </td>
                  <td className="px-3 py-2.25 text-center text-[12px] tabular-nums text-zinc-600">
                    {exp.resist}
                  </td>
                  <td className="px-3 py-2.25 text-center text-[12px] tabular-nums text-zinc-600">
                    {exp.immune}
                  </td>
                  <td className="px-3 py-2.25 text-center text-[12px] tabular-nums text-zinc-400">
                    {exp.neutral}
                  </td>
                  <td className="px-4 py-2.25">
                    <div className="flex gap-0.5">
                      {members.map((m, idx) => {
                        const mult = TypeEffectiveness.getMultiplier(
                          atk,
                          m.types,
                        );
                        let bg = "bg-zinc-100";
                        if (mult === 0) bg = "bg-zinc-900";
                        else if (mult > 1)
                          bg = isCritical ? "bg-red-600" : "bg-zinc-800";
                        else if (mult < 1) bg = "bg-zinc-300";
                        return (
                          <div
                            key={getMemberStableId(m, idx)}
                            className={`h-3.5 w-3.5 rounded-[3px] ${bg}`}
                          />
                        );
                      })}
                      {Array.from({ length: 6 }, (_, pos) => pos)
                        .slice(members.length)
                        .map((pos) => (
                          <div
                            key={`empty-${atk}-pos-${pos}`}
                            className="h-3.5 w-3.5 rounded-[3px] border border-dashed border-zinc-200"
                          />
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hoveredType &&
        tooltipPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-200 max-w-60 rounded-[10px] border border-zinc-200 bg-zinc-900 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {hoveredType} → débiles
            </div>
            <div className="mt-1 text-[12px] leading-[1.4] text-white">
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
