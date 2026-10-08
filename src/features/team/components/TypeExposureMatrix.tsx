"use client";

import { useState, useMemo } from "react";
import { useTeamStore } from "../store/useTeamStore";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import type { TeamMember, TypeExposure } from "@/domain/team/types/TeamTypes";
import { translateTypeToSpanish } from "../constants/typeTranslations";

type MemberWithMeta = TeamMember & {
  readonly displayNameEs?: string;
  readonly name?: string;
  readonly species?: string;
  readonly id?: string;
};

function getMemberName(member: TeamMember): string {
  const meta = member as unknown as MemberWithMeta;
  return (
    meta.displayNameEs ?? meta.name ?? meta.species ?? meta.id ?? "Desconocido"
  );
}

const EMPTY_EXPOSURE: TypeExposure = {
  weak: 0,
  resist: 0,
  immune: 0,
  neutral: 0,
};

function getExposure(
  coverage: Record<string, TypeExposure> | undefined,
  type: PokemonType,
  teamSize: number,
): TypeExposure {
  if (!coverage) return { ...EMPTY_EXPOSURE, neutral: teamSize };
  return coverage[type] ?? { ...EMPTY_EXPOSURE, neutral: teamSize };
}

export function TypeExposureMatrix() {
  const team = useTeamStore((s) => s.team);
  const analysis = useTeamStore((s) => s.analysis);
  const members = team.getMembers();
  const [hoveredType, setHoveredType] = useState<PokemonType | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [activeFilter, setActiveFilter] = useState<
    "todos" | "criticos" | "debiles"
  >("todos");

  const coverage = analysis?.defensiveCoverage;

  const criticalTypes = useMemo(() => {
    if (!coverage) return [];
    return ALL_POKEMON_TYPES.filter((t) => {
      const exp = getExposure(coverage, t, members.length);
      return exp.weak >= 3 && exp.resist + exp.immune <= 1;
    });
  }, [coverage, members.length]);

  const sortedTypes = useMemo(() => {
    if (!coverage) return [...ALL_POKEMON_TYPES];
    const list = [...ALL_POKEMON_TYPES];
    if (activeFilter === "criticos") {
      return list
        .filter((t) => {
          const exp = getExposure(coverage, t, members.length);
          return exp.weak >= 2;
        })
        .sort((a, b) => {
          const expA = getExposure(coverage, a, members.length);
          const expB = getExposure(coverage, b, members.length);
          return expB.weak - expA.weak;
        });
    }
    if (activeFilter === "debiles") {
      return list.sort((a, b) => {
        const expA = getExposure(coverage, a, members.length);
        const expB = getExposure(coverage, b, members.length);
        return expB.weak - expA.weak;
      });
    }
    return list;
  }, [coverage, activeFilter, members.length]);

  const getWeakMembers = (atk: PokemonType) => {
    return members.filter(
      (m) =>
        TypeEffectiveness.getMultiplier(
          atk,
          m.types as readonly PokemonType[],
          m.abilityId ?? m.ability ?? null,
          m.itemId ?? m.item ?? null,
        ) > 1,
    );
  };

  if (members.length === 0) {
    return (
      <section
        className="border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-8 text-center"
        aria-labelledby="matriz-vacia"
      >
        <h3
          id="matriz-vacia"
          className="font-serif text-[14px] font-semibold text-[#111]"
        >
          Matriz defensiva inactiva
        </h3>
        <p className="mx-auto mt-2 max-w-[40ch] text-[12px] leading-normal text-zinc-600">
          Añade al menos 1 Pokémon. Cada fila muestra cuántos miembros son
          débiles, resisten o son inmunes a cada tipo atacante.
        </p>
        <div className="mt-4 inline-flex border border-[#EDE8E0] bg-white px-3 py-1.5 text-[11px] text-zinc-500">
          Definición: cobertura = tipos donde al menos 1 miembro resiste o es
          inmune.
        </div>
      </section>
    );
  }

  if (!coverage) return null;

  const totalTipos = ALL_POKEMON_TYPES.length;
  const cubiertos = ALL_POKEMON_TYPES.filter((t) => {
    const exp = getExposure(coverage, t, members.length);
    return exp.resist + exp.immune > 0;
  }).length;
  const porcentajeCobertura = Math.round((cubiertos / totalTipos) * 100);

  return (
    <section
      className="border border-[#EDE8E0] bg-white"
      aria-labelledby="matriz-title"
    >
      <div className="border-b border-[#EDE8E0] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="matriz-title"
              className="text-[11px] font-semibold uppercase tracking-widest text-[#111]"
            >
              Matriz de exposición defensiva
            </h2>
            <p className="mt-1.5 max-w-[56ch] text-[11px] leading-normal text-zinc-600">
              Cada fila = tipo atacante. Columnas = cuántos miembros son
              débiles, resisten, inmunes o neutros. Considera habilidades con
              inmunidad y Globo.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Cobertura
            </div>
            <div className="font-serif text-[18px] font-semibold tabular-nums leading-none text-[#111]">
              {porcentajeCobertura}%
            </div>
            <div className="mt-1 text-[10px] text-zinc-500">
              {cubiertos}/{totalTipos} tipos cubiertos
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-1 border-t border-[#F5F1E8] pt-3">
          {[
            { id: "todos", label: "Todos" },
            { id: "debiles", label: "Más débiles primero" },
            { id: "criticos", label: `Críticos (${criticalTypes.length})` },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`border px-2.5 py-1 text-[11px] ${activeFilter === f.id ? "border-[#111] bg-[#111] text-white" : "border-[#EDE8E0] bg-white text-zinc-600 hover:border-zinc-400"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#EDE8E0] bg-[#F8F5F0] text-[10px] uppercase tracking-widest text-zinc-500">
              <th className="px-4 py-2.5 font-medium">Tipo atacante</th>
              <th className="px-3 py-2.5 text-center font-medium">Débil</th>
              <th className="px-3 py-2.5 text-center font-medium">Resiste</th>
              <th className="px-3 py-2.5 text-center font-medium">Inmune</th>
              <th className="px-3 py-2.5 text-center font-medium">Neutro</th>
              <th className="px-4 py-2.5 font-medium">Cobertura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F1E8]">
            {sortedTypes.map((atk) => {
              const exp = getExposure(coverage, atk, members.length);
              const isCritical = exp.weak >= 3 && exp.resist + exp.immune <= 1;
              const coberturaPct = Math.round(
                ((exp.resist + exp.immune) / Math.max(1, members.length)) * 100,
              );
              const weakMembers = getWeakMembers(atk);

              return (
                <tr
                  key={atk}
                  className={`group ${isCritical ? "bg-[#FEF2F2]" : "hover:bg-[#FCFBF8]"}`}
                  onMouseEnter={(e) => {
                    setHoveredType(atk);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setHoveredType(null)}
                  onFocus={(e) => {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    setHoveredType(atk);
                    setTooltipPos({ x: rect.right, y: rect.top });
                  }}
                  onBlur={() => setHoveredType(null)}
                  tabIndex={0}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-medium uppercase tracking-widest ${isCritical ? "text-[#991B1B]" : "text-[#111]"}`}
                      >
                        {translateTypeToSpanish(atk)}
                      </span>
                      {isCritical && (
                        <span
                          className="h-1 w-1 rounded-full bg-[#D93B32]"
                          aria-hidden
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-7 justify-center border px-1.5 py-0.5 text-[12px] tabular-nums ${exp.weak > 0 ? "border-red-200 bg-[#FEF2F2] font-semibold text-[#991B1B]" : "border-transparent text-zinc-300"}`}
                    >
                      {exp.weak}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-7 justify-center border px-1.5 py-0.5 text-[12px] tabular-nums ${exp.resist > 0 ? "border-emerald-200 bg-[#F0FDF4] text-[#166534]" : "border-transparent text-zinc-300"}`}
                    >
                      {exp.resist}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`inline-flex min-w-7 justify-center border px-1.5 py-0.5 text-[12px] tabular-nums ${exp.immune > 0 ? "border-zinc-900 bg-[#111] text-white" : "border-transparent text-zinc-300"}`}
                    >
                      {exp.immune}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-[12px] tabular-nums text-zinc-500">
                    {exp.neutral}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 bg-[#EDE8E0]">
                        <div
                          className={`h-1 ${isCritical ? "bg-[#D93B32]" : "bg-[#111]"}`}
                          style={{ width: `${coberturaPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums text-zinc-600">
                        {coberturaPct}%
                      </span>
                      {weakMembers.length > 0 && isCritical && (
                        <span className="hidden text-[10px] text-zinc-500 lg:inline">
                          · {weakMembers.length} débiles
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] px-5 py-3 text-[11px] leading-normal text-zinc-600">
        Definición precisa:{" "}
        <span className="font-medium text-[#111]">cobertura</span> = % de tipos
        donde al menos 1 miembro resiste o es inmune. No es daño infligido.
        Inmunidades por habilidad (Levitación → Tierra) y objeto (Globo →
        Tierra) ya consideradas.
      </div>

      {hoveredType && tooltipPos && (
        <div
          className="pointer-events-none fixed z-50 max-w-70 border border-[#111] bg-[#111] px-3 py-2.5"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          <div className="text-[10px] uppercase tracking-widest text-zinc-400">
            {translateTypeToSpanish(hoveredType)} · débiles
          </div>
          <div className="mt-1 text-[12px] leading-normal text-white">
            {getWeakMembers(hoveredType).length === 0
              ? "Ningún miembro es débil a este tipo."
              : getWeakMembers(hoveredType)
                  .map((m) => getMemberName(m))
                  .join(", ")}
          </div>
          <div className="mt-1.5 text-[10px] text-zinc-400">
            {(() => {
              const exp = getExposure(coverage, hoveredType, members.length);
              return `${exp.weak} débiles · ${exp.resist} resisten · ${exp.immune} inmunes`;
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
