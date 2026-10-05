"use client";

import { useState, useMemo } from "react";
import { useTeamStore } from "../store/useTeamStore";
import type { Severity, TeamMember } from "@/domain/team/types/TeamTypes";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { translateTypeToSpanish } from "../constants/typeTranslations";

type MemberWithMeta = TeamMember & {
  readonly displayNameEs?: string;
  readonly name?: string;
  readonly species?: string;
};

function getMemberDisplayName(member: TeamMember): string {
  const meta = member as MemberWithMeta;
  return meta.displayNameEs ?? meta.name ?? meta.species ?? "Desconocido";
}

const SEVERITY_LABEL: Record<Severity, { label: string; descripcion: string }> =
  {
    Critical: { label: "Crítico", descripcion: "Corrige antes de competir" },
    High: { label: "Alto", descripcion: "Atención prioritaria" },
    Medium: { label: "Medio", descripcion: "Mejora recomendada" },
    Low: { label: "Bajo", descripcion: "Informativo" },
    Info: { label: "Info", descripcion: "Nota táctica" },
  };

export function RecommendationList() {
  const analysis = useTeamStore((s) => s.analysis);
  const team = useTeamStore((s) => s.team);
  const members = team.getMembers();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    if (!analysis) return [];
    return [...analysis.recommendations];
  }, [analysis]);

  if (team.isEmpty()) {
    return (
      <section
        className="border border-[#EDE8E0] bg-[#FFFEFB] p-8 text-center"
        aria-labelledby="motor-espera"
      >
        <h3
          id="motor-espera"
          className="font-serif text-[14px] font-semibold text-[#111]"
        >
          Informe táctico en espera
        </h3>
        <p className="mx-auto mt-2 max-w-[36ch] text-[12px] leading-normal text-zinc-600">
          Añade Pokémon para activar el motor de explicabilidad. Cada hallazgo
          explica qué ocurre, por qué importa y qué hacer.
        </p>
      </section>
    );
  }

  if (!analysis || analysis.recommendations.length === 0) {
    return (
      <section
        className="border border-[#EDE8E0] bg-white"
        aria-labelledby="equipo-ok"
      >
        <div className="px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                id="equipo-ok"
                className="font-serif text-[15px] font-semibold text-[#111]"
              >
                Equipo equilibrado
              </h3>
              <p className="mt-1 text-[12px] leading-normal text-zinc-600">
                Sin vulnerabilidades críticas detectadas. Cobertura con
                redundancia.
              </p>
            </div>
            <div className="border border-emerald-200 bg-[#F0FDF4] px-2.5 py-1 text-[10px] uppercase tracking-widest text-emerald-800">
              100% cobertura
            </div>
          </div>
        </div>
      </section>
    );
  }

  const criticalCount = analysis.recommendations.filter(
    (r) => r.severity === "Critical",
  ).length;

  return (
    <section
      className="border border-[#EDE8E0] bg-white"
      aria-labelledby="informe-title"
    >
      <div className="border-b border-[#EDE8E0] bg-[#111] px-4 py-4 text-white sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2
              id="informe-title"
              className="font-serif text-[14px] font-semibold tracking-[-0.01em]"
            >
              Informe táctico
            </h2>
            <p className="mt-1 max-w-[42ch] text-[11px] leading-normal text-zinc-400">
              Qué ocurre, por qué importa y cómo corregirlo. Sin jerga
              innecesaria.
            </p>
          </div>
          <div className="shrink-0 self-start border border-white/20 px-2 py-1 text-[9px] uppercase tracking-widest sm:px-2.5 sm:text-[10px]">
            {sorted.length} hallazgos
            {criticalCount > 0 ? ` · ${criticalCount} crít.` : ""}
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#F5F1E8]">
        {sorted.map((rec) => {
          const sev = SEVERITY_LABEL[rec.severity];
          const affected = members.filter((m) => {
            const mult = TypeEffectiveness.getMultiplier(
              rec.attackingType,
              m.types as readonly PokemonType[],
              m.abilityId ?? m.ability ?? null,
              m.itemId ?? m.item ?? null,
            );
            return mult > 1;
          });
          const tipoEs = translateTypeToSpanish(rec.attackingType);
          const isExpanded = expandedId === rec.id;
          const tipoLabel =
            rec.type === "Defensive Gap"
              ? "Sinergia defensiva"
              : rec.type === "Dependency"
                ? "Dependencia"
                : "Velocidad";

          return (
            <article key={rec.id} className="px-5 py-5">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest">
                <span
                  className={`border px-2 py-0.5 ${rec.severity === "Critical" ? "border-[#D93B32] bg-[#FEF2F2] text-[#991B1B]" : rec.severity === "High" ? "border-[#111] bg-[#111] text-white" : "border-[#EDE8E0] bg-white text-zinc-600"}`}
                >
                  {sev.label}
                </span>
                <span className="text-zinc-400">{tipoLabel}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-zinc-500">{sev.descripcion}</span>
                <span className="ml-auto border border-[#EDE8E0] bg-[#F8F5F0] px-2 py-0.5 font-medium text-[#111]">
                  {tipoEs.toUpperCase()}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-[15px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#111]">
                {rec.attackingType === "normal"
                  ? rec.title
                  : `${affected.length} Pokémon son débiles a ${tipoEs} y solo ${rec.evidence ? (rec.evidence.resist as number) + (rec.evidence.immune as number) : "1"} ofrece resistencia.`}
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-3 text-[12px] leading-[1.6]">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    Por qué importa
                  </div>
                  <p className="mt-1 text-zinc-700">{rec.reason}</p>
                </div>
                {affected.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                      Afectados ({affected.length})
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {affected.map((m) => (
                        <span
                          key={getMemberDisplayName(m)}
                          className="border border-[#EDE8E0] bg-white px-2 py-0.5 text-[11px] text-zinc-700"
                        >
                          {getMemberDisplayName(m)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border border-amber-200 bg-[#FFFBEB] px-3 py-2.5">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-amber-900">
                    Qué hacer
                  </div>
                  <p className="mt-1 text-[11px] leading-normal text-zinc-800">
                    {rec.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                className="mt-3 text-[11px] text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-[#111] hover:decoration-[#111]"
              >
                {isExpanded ? "Ocultar evidencia" : "Ver evidencia técnica"}
              </button>

              {isExpanded && rec.evidence && (
                <div className="mt-3 border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[11px] tabular-nums text-zinc-600">
                  {Object.entries(rec.evidence)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] px-5 py-3">
        <p className="text-[11px] leading-normal text-zinc-600">
          El informe enseña estrategia: cada hallazgo incluye contexto
          competitivo real, no frases genéricas. Revisa la matriz para validar
          el impacto del cambio.
        </p>
      </div>
    </section>
  );
}
