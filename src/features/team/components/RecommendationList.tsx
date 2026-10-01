"use client";

import { useTeamStore } from "../store/useTeamStore";
import type { Severity } from "@/domain/team/types/TeamTypes";

const severityStyles: Record<
  Severity,
  { label: string; border: string; badge: string; icon: string }
> = {
  Critical: {
    label: "CRÍTICO",
    border: "border-l-red-600",
    badge: "bg-red-600 text-white",
    icon: "●",
  },
  High: {
    label: "ALTO",
    border: "border-l-zinc-900",
    badge: "bg-zinc-900 text-white",
    icon: "▲",
  },
  Medium: {
    label: "MEDIO",
    border: "border-l-zinc-400",
    badge: "bg-zinc-100 text-zinc-700",
    icon: "■",
  },
  Low: {
    label: "BAJO",
    border: "border-l-zinc-300",
    badge: "bg-zinc-50 text-zinc-500",
    icon: "–",
  },
  Info: {
    label: "INFO",
    border: "border-l-zinc-200",
    badge: "bg-zinc-50 text-zinc-500",
    icon: "i",
  },
};

export function RecommendationList() {
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);

  if (team.isEmpty()) return null;

  if (!analysis || analysis.recommendations.length === 0) {
    return (
      <div className="rounded-[12px] border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <h3 className="font-serif text-[14px] font-semibold text-zinc-900">
            Equipo balanceado
          </h3>
        </div>
        <p className="mt-2 text-[12px] leading-normal text-zinc-500">
          No se detectaron vulnerabilidades críticas. Tu redundancia defensiva
          cubre los 18 tipos. Velocidad promedio:{" "}
          {Math.round(analysis?.averageSpeed ?? 0)}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="font-serif text-[14px] font-semibold tracking-[-0.01em] text-zinc-900">
          Motor de Explicabilidad
        </h3>
        <span className="text-[11px] tabular-nums text-zinc-500">
          {analysis.recommendations.length} hallazgos • Vel. Promedio{" "}
          {Math.round(analysis.averageSpeed)}
        </span>
      </div>

      {analysis.recommendations.map((rec) => {
        const style = severityStyles[rec.severity];
        const key = `${rec.type}-${rec.attackingType}-${rec.severity}`;
        return (
          <div
            key={key}
            className={`rounded-[12px] border border-zinc-200 bg-white p-4 border-l-[3px] ${style.border} transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-[6px] px-1.5 py-0.5 text-[10px] font-[650] tracking-wide ${style.badge}`}
                >
                  {style.label}
                </span>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                  {rec.attackingType}
                </span>
                <span className="text-[11px] tabular-nums text-zinc-500">
                  {rec.affectedCount} afectados
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">{rec.type}</span>
            </div>

            <h4 className="mt-3 font-serif text-[14px] font-[550] leading-[1.3] tracking-[-0.01em] text-zinc-900">
              {rec.title}
            </h4>
            <p className="mt-1.5 text-[12px] leading-normal text-zinc-600">
              {rec.reason}
            </p>

            <div className="mt-3 rounded-[8px] bg-zinc-50 px-3 py-2.5">
              <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Acción sugerida
              </div>
              <p className="mt-1 text-[12px] leading-normal text-zinc-700">
                {rec.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
