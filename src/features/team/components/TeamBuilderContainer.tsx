"use client";
import { useState } from "react";
import { useTeamStore } from "../store/useTeamStore";
import { RecommendationList } from "./RecommendationList";
import { ShowdownModal } from "./ShowdownModal";
import { TeamBuilderGrid } from "./TeamBuilderGrid";
import { TypeExposureMatrix } from "./TypeExposureMatrix";

function EstadoEquipo({ size, risks }: { size: number; risks: number }) {
  if (size === 0)
    return (
      <div className="inline-flex items-center gap-1.5 border border-[#EDE8E0] bg-white px-2.5 py-1">
        <span className="h-1 w-1 rounded-full bg-zinc-400" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Vacío
        </span>
      </div>
    );
  if (size < 6)
    return (
      <div className="inline-flex items-center gap-1.5 border border-amber-200 bg-[#FFFBEB] px-2.5 py-1">
        <span className="h-1 w-1 animate-pulse rounded-full bg-amber-600" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-amber-900">
          {size}/6 · En construcción
        </span>
      </div>
    );
  if (risks === 0)
    return (
      <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 text-white">
        <span className="h-1 w-1 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-medium uppercase tracking-widest">
          Equilibrado
        </span>
      </div>
    );
  return (
    <div className="inline-flex items-center gap-1.5 border border-[#D93B32] bg-[#FEF2F2] px-2.5 py-1">
      <span className="h-1 w-1 rounded-full bg-[#D93B32]" />
      <span className="text-[10px] font-medium uppercase tracking-widest text-[#991B1B]">
        {risks} riesgos
      </span>
    </div>
  );
}

export function TeamBuilderContainer() {
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const team = useTeamStore((s) => s.team);
  const analysis = useTeamStore((s) => s.analysis);
  const size = team.size;
  const risks =
    analysis?.recommendations.filter((r) => r.severity === "Critical").length ??
    0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDE8E0] pb-4">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-[18px] font-semibold text-[#111]">
            Team Builder
          </h1>
          <EstadoEquipo size={size} risks={risks} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="border border-[#EDE8E0] bg-white px-3 py-1.5 text-[11px]"
          >
            Importar Showdown
          </button>
          <button
            type="button"
            onClick={() => setShowExport(true)}
            className="border border-[#EDE8E0] bg-white px-3 py-1.5 text-[11px]"
          >
            Exportar Showdown
          </button>
        </div>
      </div>
      <TeamBuilderGrid />
      <TypeExposureMatrix />
      <RecommendationList />
      <ShowdownModal
        open={showImport}
        onClose={() => setShowImport(false)}
        mode="import"
      />
      <ShowdownModal
        open={showExport}
        onClose={() => setShowExport(false)}
        mode="export"
      />
    </div>
  );
}
