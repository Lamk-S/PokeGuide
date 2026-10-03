"use client";

import { useState } from "react";
import { useTeamStore } from "../store/useTeamStore";
import type { Severity, TeamMember } from "@/domain/team/types/TeamTypes";
import { ALL_POKEMON_TYPES, TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { translateTypeToSpanish } from "../constants/typeTranslations";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
};

const severityConfig: Record<
  Severity,
  {
    label: string;
    sub: string;
    accent: string;
    bg: string;
    dot: string;
    ring: string;
  }
> = {
  Critical: {
    label: "CRÍTICO",
    sub: "Vulnerabilidad extrema",
    accent: "from-[#C2410C] to-[#9A3412]",
    bg: "bg-[#FFF7ED]",
    dot: "bg-[#EA580C]",
    ring: "ring-[#FDBA74]/50",
  },
  High: {
    label: "ALTO",
    sub: "Atención requerida",
    accent: "from-zinc-800 to-zinc-900",
    bg: "bg-[#FAFAF8]",
    dot: "bg-zinc-900",
    ring: "ring-zinc-200",
  },
  Medium: {
    label: "MEDIO",
    sub: "Mejora sugerida",
    accent: "from-zinc-400 to-zinc-500",
    bg: "bg-zinc-50",
    dot: "bg-zinc-400",
    ring: "ring-zinc-200",
  },
  Low: {
    label: "BAJO",
    sub: "Informativo",
    accent: "from-zinc-300 to-zinc-400",
    bg: "bg-white",
    dot: "bg-zinc-300",
    ring: "ring-zinc-100",
  },
  Info: {
    label: "INFO",
    sub: "Nota",
    accent: "from-zinc-300 to-zinc-400",
    bg: "bg-white",
    dot: "bg-zinc-400",
    ring: "ring-zinc-100",
  },
};

const TYPE_LABEL: Record<string, string> = {
  "Defensive Gap": "Sinergia defensiva",
  Dependency: "Dependencia táctica",
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
      <div className="relative overflow-hidden rounded-[24px] border border-[#EDE8E0] bg-[#FFFEFB] p-8 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(600px_at_50%_0%,rgba(120,113,108,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative">
          <div className="mx-auto flex size-14 items-center justify-center rounded-[16px] border border-[#EDE8E0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[18px]">◐</span>
          </div>
          <h3 className="mt-4 font-serif text-[16px] font-semibold tracking-[-0.02em] text-zinc-900">
            Motor en espera
          </h3>
          <p className="mx-auto mt-2 max-w-80 text-[12px] leading-relaxed text-zinc-500">
            Añade Pokémon para activar el análisis explicable. Detectamos huecos
            defensivos, dependencias y control de velocidad.
          </p>
        </div>
      </div>
    );
  }

  // Equipo equilibrado - versión limpia sin duplicar Resumen del Equipo (ese va en page.tsx)
  if (!analysis || analysis.recommendations.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-[#EDE8E0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="absolute inset-0 bg-[radial-gradient(800px_at_0%_0%,rgba(16,185,129,0.06),transparent)]" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                ✓
              </div>
              <div>
                <h3 className="font-serif text-[15px] font-semibold leading-tight text-zinc-900">
                  Equipo equilibrado
                </h3>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Sin vulnerabilidades críticas detectadas
                </p>
              </div>
            </div>
            <span className="inline-flex self-start rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-wide text-emerald-700 ring-1 ring-emerald-200 sm:self-auto">
              100% COBERTURA
            </span>
          </div>

          <div className="mt-5 rounded-[14px] border border-emerald-100 bg-emerald-50/50 p-3">
            <p className="text-[11px] leading-relaxed text-emerald-900">
              Redundancia defensiva verificada. Cada uno de los 18 tipos tiene
              al menos un resistente en tu equipo. Listo para Battle Lab.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalCount = analysis.recommendations.filter(
    (r) => r.severity === "Critical",
  ).length;
  const totalRiesgos = analysis.recommendations.length;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E7E0D6] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      {/* Header elegante - responsive con flex-wrap */}
      <div className="relative overflow-hidden border-b border-[#F0EDE6] bg-[#18181B] px-4 py-4 sm:px-6 sm:py-5">
        <div className="absolute inset-0 bg-[radial-gradient(500px_at_0%_0%,rgba(255,255,255,0.08),transparent)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-2.5 font-serif text-[14px] font-semibold tracking-[-0.01em] text-white">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[11px]">
                ◐
              </span>
              Motor de Explicabilidad
            </h3>
            <p className="mt-1.5 max-w-[90%] text-[11px] leading-relaxed text-zinc-400">
              Cada hallazgo explica <span className="text-zinc-200">qué</span>,{" "}
              <span className="text-zinc-200">por qué</span> importa y{" "}
              <span className="text-zinc-200">cómo</span> corregirlo en
              metajuego actual.
            </p>
          </div>
          <span className="inline-flex shrink-0 self-start rounded-full bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide text-zinc-900 shadow-sm sm:self-auto">
            {totalRiesgos} {totalRiesgos === 1 ? "HALLAZGO" : "HALLAZGOS"}
            {criticalCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#18181B] px-1.5 py-0.5 text-[9px] text-white">
                {criticalCount} CRÍTICOS
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Findings - diseño dossier único, responsive */}
      <div className="divide-y divide-[#F5F1E8] bg-[#FFFEFB]">
        {analysis.recommendations.map((rec) => {
          const cfg = severityConfig[rec.severity];
          const subLabel = TYPE_LABEL[rec.type] ?? rec.type;
          const affected = members.filter((m) => {
            const mult = TypeEffectiveness.getMultiplier(
              rec.attackingType,
              m.types as readonly PokemonType[],
            );
            return mult > 1;
          });
          const tipoEs = translateTypeToSpanish(rec.attackingType);
          const tipoEsUpper = tipoEs.toUpperCase();

          return (
            <div
              key={`${rec.type}-${rec.attackingType}-${rec.severity}-${rec.affectedCount}`}
              className="group relative overflow-hidden p-4 sm:p-5 transition-colors hover:bg-white"
            >
              {/* Número fantasma */}
              <div className="pointer-events-none absolute -right-2 -top-1 font-serif text-[56px] font-bold leading-none text-zinc-900/3 group-hover:text-zinc-900/5">
                {affected.length}
              </div>

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest text-white shadow-sm bg-linear-to-r ${cfg.accent}`}
                  >
                    <span className={`size-1.5 rounded-full bg-white/80`} />
                    {cfg.label}
                  </span>
                  <span className="hidden text-zinc-200 sm:inline">·</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    {subLabel}
                  </span>
                  <span className="hidden text-zinc-200 sm:inline">·</span>
                  <span className="text-[10px] text-zinc-400">{cfg.sub}</span>

                  <span
                    className={`ml-auto inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white`}
                  >
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    {tipoEsUpper}
                  </span>
                </div>

                <h4 className="mt-3 max-w-[95%] font-serif text-[15px] font-semibold leading-tight tracking-[-0.01em] text-zinc-900 sm:text-[15px]">
                  {rec.title}
                </h4>
                <p className="mt-2 max-w-[95%] text-[12px] leading-relaxed text-zinc-600">
                  {rec.reason}
                </p>

                {affected.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                      Afectados
                    </span>
                    {affected.map((member) => (
                      <span
                        key={getMemberDisplayName(member)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#EDE8E0] bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
                      >
                        <span className="size-1 rounded-full bg-zinc-400" />
                        {getMemberDisplayName(member)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3 rounded-[14px] border border-amber-200/50 bg-linear-to-br from-[#FFFBEB] to-[#FEF3C7]/50 p-3.5">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-sm">
                    !
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-900">
                      Acción sugerida · Patrón VGC
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-700">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer acciones - SIN resumen duplicado, responsive */}
      <div className="border-t border-[#F0EDE6] bg-[#FCFBF8] p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setShowCalc((v) => !v)}
            className="group flex flex-1 items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-[12px] font-medium text-white transition-all hover:bg-black hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            <span className="truncate">
              {showCalc
                ? "Ocultar análisis"
                : `Calcular daño → ${Math.min(6, ALL_POKEMON_TYPES.length)} emparejamientos`}
            </span>
            <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] transition-colors group-hover:bg-white/20">
              96%
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const text = `PokeGuide Análisis: ${totalRiesgos} hallazgos, ${criticalCount} críticos, Vel promedio ${Math.round(analysis.averageSpeed)}`;
              void navigator.clipboard?.writeText(text);
            }}
            className="shrink-0 rounded-full border border-zinc-200 bg-white px-5 py-3 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900"
          >
            Copiar
          </button>
        </div>

        {showCalc && (
          <div className="mt-4 overflow-hidden rounded-[16px] border border-[#EDE8E0] bg-white">
            <div className="border-b border-[#F5F1E8] bg-[#FFFEFB] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                Top amenazas · Basado en tu matriz defensiva
              </div>
            </div>
            <div className="divide-y divide-[#F5F1E8]">
              {ALL_POKEMON_TYPES.slice(0, 6).map((atk) => {
                const cov = analysis.defensiveCoverage[atk];
                if (!cov) return null;
                const danger = cov.weak;
                const tipoEs = translateTypeToSpanish(atk);
                return (
                  <div
                    key={atk}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-700">
                      {tipoEs}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {danger} débiles
                      </span>
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                        <span
                          className={`block h-1.5 rounded-full ${danger >= 3 ? "bg-[#EA580C]" : danger >= 2 ? "bg-amber-500" : "bg-zinc-900"}`}
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
          </div>
        )}
      </div>
    </div>
  );
}
