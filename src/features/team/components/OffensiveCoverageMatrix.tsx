"use client";
import { useEffect, useMemo, useState } from "react";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import {
  type MoveMeta,
  OffensiveAnalyzer,
  type TeamOffensiveAnalysis,
} from "@/domain/team/services/analyzers/OffensiveAnalyzer";
import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import { useTeamStore } from "@/features/team/store/useTeamStore";
import { LocalMoveRepository } from "@/infrastructure/local-data/repositories/local-move.repository";
import { translateTypeToSpanish } from "../constants/typeTranslations";

interface ResolvedMove {
  readonly id: string;
  readonly name?: string;
}

function getMoveIds(members: readonly TeamMember[]): string[] {
  const ids: string[] = [];
  for (const member of members) {
    const moves = (
      member as unknown as { moves?: readonly (string | ResolvedMove)[] }
    ).moves;
    if (!moves) continue;
    for (const m of moves) {
      if (typeof m === "string" && m.trim()) ids.push(m.toLowerCase().trim());
      else if (
        m &&
        typeof m === "object" &&
        "id" in m &&
        typeof (m as ResolvedMove).id === "string"
      )
        ids.push((m as ResolvedMove).id.toLowerCase().trim());
    }
  }
  return ids;
}

export function OffensiveCoverageMatrix() {
  const team = useTeamStore((s) => s.team);
  const members = team.getMembers() as readonly TeamMember[];
  const [moveMetaMap, setMoveMetaMap] = useState<ReadonlyMap<string, MoveMeta>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const moveIds = getMoveIds(members);
      if (moveIds.length === 0) {
        if (!cancelled) setMoveMetaMap(new Map());
        return;
      }
      setLoading(true);
      try {
        const dtoMap = await LocalMoveRepository.getByIds(moveIds);
        if (cancelled) return;
        const converted = new Map<string, MoveMeta>(
          [...dtoMap.entries()].map(([id, dto]) => [
            id.toLowerCase(),
            { id: dto.id, type: dto.type as PokemonType, power: dto.power },
          ]),
        );
        setMoveMetaMap(converted);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [members]);

  const analysis: TeamOffensiveAnalysis | null = useMemo(() => {
    if (members.length === 0) return null;
    return OffensiveAnalyzer.analyze(members, moveMetaMap);
  }, [members, moveMetaMap]);

  if (members.length === 0) {
    return (
      <section className="border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-6 text-center">
        <h3 className="font-serif text-[13px] font-semibold text-[#111]">
          Cobertura ofensiva inactiva
        </h3>
        <p className="mx-auto mt-1 max-w-[40ch] text-[11px] text-zinc-600">
          Añade movimientos con MoveSelector para calcular qué tipos enemigos no
          puedes golpear súper eficazmente.
        </p>
      </section>
    );
  }

  if (loading || !analysis) {
    return (
      <div className="border border-[#EDE8E0] p-4 text-[11px] text-zinc-600">
        Calculando cobertura ofensiva real con TypeChart...
      </div>
    );
  }

  return (
    <section className="border border-[#EDE8E0] bg-white">
      <div className="border-b border-[#EDE8E0] px-5 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#111]">
          Matriz de cobertura ofensiva (Datos Reales)
        </h2>
        <p className="mt-1 text-[11px] text-zinc-600">
          Cruza TypeChart + LocalMoveRepository. Si falta cobertura vs
          Hada/Acero, el equipo sufre.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 w-24 bg-[#EDE8E0]">
            <div
              className="h-1 bg-[#111]"
              style={{ width: `${analysis.totalCoveragePercent}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums">
            {analysis.totalCoveragePercent}% cobertura · {moveMetaMap.size}{" "}
            movimientos analizados
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-[#EDE8E0] sm:grid-cols-3">
        {ALL_POKEMON_TYPES.map((defType) => {
          const info = analysis.coverageMap[defType];
          const isUncovered = !info.covered;
          return (
            <div
              key={defType}
              className={`px-3 py-2 ${isUncovered ? "bg-[#FEF2F2]" : "bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] uppercase tracking-widest ${isUncovered ? "font-medium text-[#991B1B]" : "text-[#111]"}`}
                >
                  {translateTypeToSpanish(defType)}
                </span>
                <span
                  className={`text-[10px] ${isUncovered ? "text-[#D93B32]" : "text-emerald-700"}`}
                >
                  {isUncovered
                    ? "Sin cobertura"
                    : `Cubierto (${info.byMoves.length})`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {analysis.uncoveredDefenderTypes.length > 0 && (
        <div className="border-t border-[#EDE8E0] bg-[#FFFBEB] px-5 py-3 text-[11px] text-amber-900">
          Alerta: no golpea SE a:{" "}
          {analysis.uncoveredDefenderTypes
            .map((t) => translateTypeToSpanish(t))
            .join(", ")}
        </div>
      )}
    </section>
  );
}
