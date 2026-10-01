"use client";

import { TeamBuilderGrid } from "@/features/team/components/TeamBuilderGrid";
import { TypeExposureMatrix } from "@/features/team/components/TypeExposureMatrix";
import { RecommendationList } from "@/features/team/components/RecommendationList";
import { useTeamStore } from "@/features/team/store/useTeamStore";

export default function TeamBuilderPage() {
  const error = useTeamStore((s) => s.error);
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-zinc-900">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-[32px] font-[650] tracking-[-0.03em] sm:text-[40px]">
              PokeGuide
            </h1>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Team Intelligence • ADR-005
            </span>
          </div>
          <p className="mt-3 max-w-160 font-serif text-[15px] leading-normal text-zinc-600">
            Herramienta Local-First, determinista y explicable. Evalúa cobertura
            defensiva frente a los 18 tipos sin LLMs.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        {error && (
          <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </div>
        )}

        <TeamBuilderGrid />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <TypeExposureMatrix />
          </div>
          <div>
            <RecommendationList />
            <div className="mt-6 rounded-[12px] border border-zinc-200 bg-white p-4">
              <h4 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                Resumen del Equipo
              </h4>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-[8px] bg-zinc-50 py-3">
                  <div className="text-[18px] font-semibold tabular-nums">
                    {team.size}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Tamaño
                  </div>
                </div>
                <div className="rounded-[8px] bg-zinc-50 py-3">
                  <div className="text-[18px] font-semibold tabular-nums">
                    {analysis ? Math.round(analysis.averageSpeed) : "-"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Vel. Promedio
                  </div>
                </div>
                <div className="rounded-[8px] bg-zinc-50 py-3">
                  <div className="text-[18px] font-semibold tabular-nums">
                    {analysis?.recommendations.length ?? 0}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Riesgos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
