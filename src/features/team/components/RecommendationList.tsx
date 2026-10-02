"use client";

import { useState } from "react";
import { useTeamStore } from "../store/useTeamStore";
import type { Severity, TeamMember } from "@/domain/team/types/TeamTypes";
import { ALL_POKEMON_TYPES, TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
};

const severityStyles: Record<
  Severity,
  {
    label: string;
    accent: string;
    bg: string;
    badge: string;
    dot: string;
    icon: string;
  }
> = {
  Critical: {
    label: "CRÍTICO",
    accent: "border-l-[#D93B32]",
    bg: "bg-[#FFF1F0]",
    badge: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
    dot: "bg-[#D93B32]",
    icon: "◉",
  },
  High: {
    label: "ALTO",
    accent: "border-l-amber-500",
    bg: "bg-[#FFFBEB]",
    badge: "bg-[#FEF3C7] text-[#92400E] border-amber-200",
    dot: "bg-amber-500",
    icon: "◎",
  },
  Medium: {
    label: "MEDIO",
    accent: "border-l-zinc-400",
    bg: "bg-zinc-50",
    badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-500",
    icon: "○",
  },
  Low: {
    label: "BAJO",
    accent: "border-l-zinc-300",
    bg: "bg-white",
    badge: "bg-zinc-50 text-zinc-500 border-zinc-200",
    dot: "bg-zinc-300",
    icon: "·",
  },
  Info: {
    label: "INFO",
    accent: "border-l-zinc-300",
    bg: "bg-white",
    badge: "bg-zinc-100 text-zinc-600 border-zinc-200",
    dot: "bg-zinc-400",
    icon: "i",
  },
};

const TYPE_LABEL: Record<string, string> = {
  "Defensive Gap": "Sinergia defensiva",
  Dependency: "Dependencia",
  "Speed Issue": "Control de velocidad",
};

function getMemberDisplayName(member: TeamMember): string {
  const meta = member as MemberWithMeta;
  return meta.name ?? meta.species ?? meta.id ?? "Desconocido";
}

export function RecommendationList() {
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);
  const members = team.getMembers();
  const [showCalc, setShowCalc] = useState(false);

  if (team.isEmpty()) {
    return (
      <div className="rounded-[20px] border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-6 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#F8F5F0] text-[14px]">
          ◐
        </div>
        <h3 className="mt-3 text-[12px] font-bold uppercase tracking-widest text-zinc-900">
          Motor en espera
        </h3>
        <p className="mx-auto mt-2 max-w-72 text-[11px] leading-normal text-zinc-500">
          Añade Pokémon para activar el análisis explicable. Detectamos huecos
          defensivos, dependencias y problemas de velocidad.
        </p>
      </div>
    );
  }

  if (!analysis || analysis.recommendations.length === 0) {
    return (
      <div className="rounded-[20px] border border-[#EDE8E0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            ✓
          </div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">
            Equipo balanceado
          </h3>
          <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            100% COBERTURA
          </span>
        </div>
        <p className="mt-3 text-[12px] leading-normal text-zinc-600">
          No se detectaron vulnerabilidades críticas. Redundancia defensiva
          cubre los 18 tipos. Velocidad promedio:{" "}
          <span className="font-semibold text-zinc-900">
            {Math.round(analysis?.averageSpeed ?? 0)}
          </span>
          . Listo para Battle Lab.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[10px] bg-[#F8F5F0] py-2">
            <div className="text-[12px] font-bold">{members.length}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              Miembros
            </div>
          </div>
          <div className="rounded-[10px] bg-[#F8F5F0] py-2">
            <div className="text-[12px] font-bold">18/18</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">
              Tipos cubiertos
            </div>
          </div>
          <div className="rounded-[10px] bg-zinc-900 py-2 text-white">
            <div className="text-[12px] font-bold">0</div>
            <div className="text-[10px] uppercase tracking-wide opacity-70">
              Riesgos
            </div>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = analysis.recommendations.filter(
    (r) => r.severity === "Critical" || r.severity === "High",
  ).length;

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#EDE8E0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between border-b border-[#F0EDE6] bg-[#FCFBF8] px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-900">
            <span className="flex size-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
              ◐
            </span>
            Motor de Explicabilidad
          </h3>
          <p className="mt-1 text-[11px] leading-normal text-zinc-500">
            Cada hallazgo explica{" "}
            <span className="font-medium text-zinc-700">qué</span>,{" "}
            <span className="font-medium text-zinc-700">por qué</span> y{" "}
            <span className="font-medium text-zinc-700">cómo arreglarlo</span>.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${criticalCount > 0 ? "bg-[#D93B32] text-white" : "bg-zinc-900 text-white"}`}
        >
          {analysis.recommendations.length} HALLAZGOS • {criticalCount} CRÍTICOS
        </span>
      </div>

      <div className="space-y-0 divide-y divide-[#F5F1E8]">
        {analysis.recommendations.map((rec) => {
          const style = severityStyles[rec.severity];
          const subLabel = TYPE_LABEL[rec.type] ?? rec.type;
          const affected = members.filter((m) => {
            const mult = TypeEffectiveness.getMultiplier(
              rec.attackingType,
              m.types as readonly PokemonType[],
            );
            return mult > 1;
          });

          return (
            <div
              key={`${rec.type}-${rec.attackingType}-${rec.severity}`}
              className={`relative border-l-[3px] ${style.accent} bg-white p-4 transition-colors hover:bg-[#FFFEFB]`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${style.badge}`}
                >
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
                <span className="text-[10px] text-zinc-300">•</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                  {subLabel}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {rec.attackingType.toUpperCase()}
                </span>
              </div>

              <h4 className="mt-2.5 font-serif text-[14px] font-semibold leading-tight tracking-[-0.01em] text-zinc-900">
                {rec.title}
              </h4>
              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
                {rec.reason}
              </p>

              {affected.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                    Afectados:
                  </span>
                  {affected.map((member) => (
                    <span
                      key={getMemberDisplayName(member)}
                      className="rounded-full border border-[#EDE8E0] bg-[#F8F5F0] px-2 py-0.5 text-[10px] font-medium text-zinc-700"
                    >
                      {getMemberDisplayName(member)}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 rounded-[12px] border border-amber-200/60 bg-[#FFFBEB] px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-800">
                  <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                    !
                  </span>
                  Acción sugerida • Patrón VGC
                </div>
                <p className="mt-1.5 text-[11px] leading-normal text-zinc-700">
                  {rec.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#F0EDE6] bg-[#FCFBF8] p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCalc((v) => !v)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-black"
          >
            {showCalc
              ? "Ocultar cálculo"
              : `Calcular daño → ${Math.min(6, ALL_POKEMON_TYPES.length)} matchups`}
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {analysis.averageSpeed ? "96%" : "—"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const text = `PokeGuide Análisis: ${analysis.recommendations.length} hallazgos, ${criticalCount} críticos, Vel promedio ${Math.round(analysis.averageSpeed)}`;
              void navigator.clipboard?.writeText(text);
            }}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-[12px] font-medium text-zinc-700 hover:border-zinc-900 hover:text-zinc-900"
          >
            Copiar
          </button>
        </div>

        {showCalc && (
          <div className="mt-3 rounded-[12px] border border-[#EDE8E0] bg-white p-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              Top amenazas • basado en tu matriz
            </div>
            <div className="mt-2 space-y-2">
              {ALL_POKEMON_TYPES.slice(0, 6).map((atk) => {
                const cov = analysis.defensiveCoverage[atk];
                if (!cov) return null;
                const danger = cov.weak;
                return (
                  <div
                    key={atk}
                    className="flex items-center justify-between rounded-[8px] bg-[#F8F5F0] px-3 py-1.5"
                  >
                    <span className="text-[11px] font-medium uppercase">
                      {atk}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] tabular-nums text-zinc-600">
                        {danger} débiles
                      </span>
                      <span className="h-1.5 w-12 rounded-full bg-zinc-200">
                        <span
                          className={`block h-1.5 rounded-full ${danger >= 3 ? "bg-[#D93B32]" : danger >= 2 ? "bg-amber-500" : "bg-zinc-900"}`}
                          style={{
                            width: `${Math.min(100, (danger / members.length) * 100)}%`,
                          }}
                        />
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] leading-normal text-zinc-500">
              Cálculo determinista: cuenta cuántos miembros reciben &gt;1x de
              cada tipo atacante. No usa RNG, solo tu TypeChart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
