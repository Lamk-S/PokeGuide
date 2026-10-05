"use client";

import { TeamBuilderGrid } from "@/features/team/components/TeamBuilderGrid";
import { TypeExposureMatrix } from "@/features/team/components/TypeExposureMatrix";
import { RecommendationList } from "@/features/team/components/RecommendationList";
import { useTeamStore } from "@/features/team/store/useTeamStore";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";

function EstadoEquipo({ size, risks }: { size: number; risks: number }) {
  if (size === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 border border-[#EDE8E0] bg-white px-2.5 py-1">
        <span className="h-1 w-1 rounded-full bg-zinc-400" aria-hidden />
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Vacío
        </span>
      </div>
    );
  }
  if (size < 6) {
    return (
      <div className="inline-flex items-center gap-1.5 border border-amber-200 bg-[#FFFBEB] px-2.5 py-1">
        <span
          className="h-1 w-1 animate-pulse rounded-full bg-amber-600"
          aria-hidden
        />
        <span className="text-[10px] font-medium uppercase tracking-widest text-amber-900">
          {size}/6 · En construcción
        </span>
      </div>
    );
  }
  if (risks === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 text-white">
        <span className="h-1 w-1 rounded-full bg-emerald-400" aria-hidden />
        <span className="text-[10px] font-medium uppercase tracking-widest">
          Equilibrado
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 bg-[#111] px-2.5 py-1 text-white">
      <span className="h-1 w-1 rounded-full bg-[#D93B32]" aria-hidden />
      <span className="text-[10px] font-medium uppercase tracking-widest">
        {risks} {risks === 1 ? "riesgo" : "riesgos"}
      </span>
    </div>
  );
}

export default function TeamBuilderPage() {
  const error = useTeamStore((s) => s.error);
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);

  const teamSize = team.size;
  const risks = analysis?.recommendations.length ?? 0;
  const promedio = analysis ? Math.round(analysis.averageSpeed) : 0;
  const maxEfectiva = analysis?.effectiveMaxSpeed ?? 0;

  return (
    <main className="min-h-screen bg-[#FFFEFB] text-zinc-900 antialiased">
      {/* Header */}
      <header className="relative z-10 border-b border-[#EDE8E0] bg-[#FFFEFB]">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <h1 className="font-serif text-[18px] font-semibold leading-none tracking-[-0.02em] text-[#111] sm:text-[20px]">
                Atlas de equipo
              </h1>
              <span className="hidden text-[10px] uppercase tracking-widest text-zinc-400 sm:block">
                · Constructor
              </span>
              <div className="hidden items-center gap-2 border-l border-[#EDE8E0] pl-3 text-[11px] sm:flex">
                <span className="text-zinc-500">
                  {DEFAULT_BATTLE_RULESET.generationLabelEs}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-700">
                  {DEFAULT_BATTLE_RULESET.formatLabelEs}
                </span>
                <span className="text-zinc-300">·</span>
                <span className="tabular-nums text-zinc-700">
                  Nv. {DEFAULT_BATTLE_RULESET.level}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden text-[11px] text-zinc-500 sm:block">
                {teamSize === 0 && "Sin análisis"}
                {teamSize > 0 && teamSize < 6 && `${6 - teamSize} restantes`}
                {teamSize === 6 && risks === 0 && "Listo"}
                {teamSize === 6 && risks > 0 && `${risks} hallazgos`}
              </div>
              <EstadoEquipo size={teamSize} risks={risks} />
            </div>
          </div>

          {/* Metadata móvil */}
          <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500 sm:hidden">
            <span>{DEFAULT_BATTLE_RULESET.generationLabelEs}</span>
            <span>·</span>
            <span>{DEFAULT_BATTLE_RULESET.formatLabelEs}</span>
            <span>·</span>
            <span>Nv. {DEFAULT_BATTLE_RULESET.level}</span>
          </div>

          {teamSize > 0 && teamSize < 6 && (
            <div className="mt-3 h-px w-full bg-[#EDE8E0]">
              <div
                className="h-px bg-[#111] transition-all duration-500"
                style={{ width: `${(teamSize / 6) * 100}%` }}
              />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-5 border border-red-200 bg-[#FEF2F2] px-3 py-2.5 text-[13px] leading-normal text-red-800">
            {error}
          </div>
        )}

        <TeamBuilderGrid />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-start">
          <TypeExposureMatrix />

          <div className="flex flex-col gap-6">
            <RecommendationList />

            <section
              className="border border-[#EDE8E0] bg-white"
              aria-labelledby="resumen-heading"
            >
              <div className="border-b border-[#EDE8E0] px-4 py-3">
                <h2
                  id="resumen-heading"
                  className="text-[11px] font-semibold uppercase tracking-widest text-zinc-900"
                >
                  Ficha táctica
                </h2>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#EDE8E0]">
                <div className="px-4 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Tamaño
                  </div>
                  <div className="mt-1.5 font-serif text-[22px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#111]">
                    {team.size}
                    <span className="ml-0.5 text-[12px] font-medium text-zinc-400">
                      /6
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500">
                    {team.size < 6 ? "En progreso" : "Completo"}
                  </div>
                </div>
                <div className="px-4 py-4">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Vel. prom.
                  </div>
                  <div className="mt-1.5 font-serif text-[22px] font-semibold leading-none tabular-nums tracking-[-0.02em] text-[#111]">
                    {analysis ? promedio : "—"}
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-500">
                    Máx {maxEfectiva || "—"}
                  </div>
                </div>
                <div className="bg-[#111] px-4 py-4 text-white">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400">
                    Riesgos
                  </div>
                  <div className="mt-1.5 font-serif text-[22px] font-semibold leading-none tabular-nums">
                    {risks}
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-400">
                    {risks === 0 ? "Sin hallazgos" : `${risks} hallazgos`}
                  </div>
                </div>
              </div>
              <div className="bg-[#F8F5F0] px-4 py-2.5 text-[11px] leading-normal text-zinc-600">
                {teamSize === 0 && "Añade Pokémon para generar ficha."}
                {teamSize > 0 &&
                  teamSize < 6 &&
                  `Faltan ${6 - teamSize} miembros para evaluación completa.`}
                {teamSize === 6 &&
                  risks === 0 &&
                  "Cobertura completa. Listo para pruebas."}
                {teamSize === 6 &&
                  risks > 0 &&
                  "Revisa informe táctico para correcciones."}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
