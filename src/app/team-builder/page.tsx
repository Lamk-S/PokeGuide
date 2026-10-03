"use client";

import { TeamBuilderGrid } from "@/features/team/components/TeamBuilderGrid";
import { TypeExposureMatrix } from "@/features/team/components/TypeExposureMatrix";
import { RecommendationList } from "@/features/team/components/RecommendationList";
import { useTeamStore } from "@/features/team/store/useTeamStore";

function AnalysisBadge({ size, risks }: { size: number; risks: number }) {
  if (size === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EDE8E0] bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-500">
        <span className="size-1.5 rounded-full bg-zinc-300" />
        EQUIPO VACÍO
      </span>
    );
  }
  if (size > 0 && size < 6) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-[#FFFBEB] px-3 py-1 text-[11px] font-semibold tracking-wide text-amber-800">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        EN CONSTRUCCIÓN • {size}/6
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
      ANÁLISIS LISTO • {risks} {risks === 1 ? "RIESGO" : "RIESGOS"}
    </span>
  );
}

export default function TeamBuilderPage() {
  const error = useTeamStore((s) => s.error);
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);

  const teamSize = team.size;
  const risks = analysis?.recommendations.length ?? 0;

  return (
    <main className="min-h-screen bg-[#F8F5F0] text-zinc-900">
      <div className="sticky top-0 z-30 w-full border-b border-[#EDE8E0] bg-[#FFFEFB]/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-start gap-4">
            <h1 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-900">
              Constructor de
              <br />
              Equipo
            </h1>
            <p className="max-w-80 border-l border-zinc-200 pl-4 text-[11px] leading-normal text-zinc-500">
              Herramienta Local-First, determinista y explicable. Sin RNG, sin
              caja negra. Basado en Battle Lab.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AnalysisBadge size={teamSize} risks={risks} />
          </div>
        </div>
        {teamSize > 0 && teamSize < 6 && (
          <div className="h-0.5 w-full bg-[#F0EDE6]">
            <div
              className="h-0.5 bg-zinc-900 transition-all duration-500"
              style={{ width: `${(teamSize / 6) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </div>
        )}

        <TeamBuilderGrid />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="min-w-0">
            <TypeExposureMatrix />
          </div>
          <div className="flex min-w-0 flex-col gap-6">
            <RecommendationList />

            {/* Resumen único y elegante - no duplica Equipo equilibrado */}
            <div className="overflow-hidden rounded-[20px] border border-[#EDE8E0] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                  Resumen del equipo
                </h4>
                <span className="shrink-0 text-[10px] text-zinc-400">
                  Determinista • Sin RNG
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[14px] border border-zinc-100 bg-[#FCFBF8] py-3.5 text-center">
                  <div className="font-serif text-[22px] font-bold leading-none tabular-nums text-zinc-900">
                    {team.size}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Tamaño
                  </div>
                </div>
                <div className="rounded-[14px] border border-zinc-100 bg-[#FCFBF8] py-3.5 text-center">
                  <div className="font-serif text-[22px] font-bold leading-none tabular-nums text-zinc-900">
                    {analysis ? Math.round(analysis.averageSpeed) : "-"}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                    Vel. promedio
                  </div>
                </div>
                <div
                  className={`rounded-[14px] py-3.5 text-center shadow-sm ${risks > 2 ? "bg-[#C2410C] text-white" : risks > 0 ? "bg-amber-500 text-white" : "bg-zinc-900 text-white"}`}
                >
                  <div className="font-serif text-[22px] font-bold leading-none tabular-nums">
                    {risks}
                  </div>
                  <div className="mt-1.5 text-[10px] font-medium uppercase tracking-widest opacity-80">
                    Riesgos
                  </div>
                </div>
              </div>
              {teamSize > 0 && (
                <div className="mt-4 rounded-[12px] bg-[#F8F5F0] px-3 py-2.5 text-[11px] leading-relaxed text-zinc-600">
                  {teamSize < 6
                    ? `Te faltan ${6 - teamSize} Pokémon para análisis completo. Añade muros y un cerrador para cerrar el equipo.`
                    : risks === 0
                      ? "Equipo equilibrado. Cobertura del 100% de tipos con redundancia defensiva verificada."
                      : `Hay ${risks} punto${risks === 1 ? "" : "s"} débil${risks === 1 ? "" : "es"}. Revisa el Motor de Explicabilidad para priorizar correcciones.`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
