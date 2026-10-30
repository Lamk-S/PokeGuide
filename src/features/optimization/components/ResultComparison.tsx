"use client";
import { useEffect, useState } from "react";
import { compareEVDistributions } from "@/domain/optimization/services/ComparisonService";
import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import type { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import {
  useBuild,
  useObjective,
  useOptimizerResults,
} from "../store/useOptimizerStore";
import { BuildPreview } from "./BuildPreview";

type PokemonData = {
  id: number;
  name: string;
  baseStats: Record<StatName, number>;
};

const repo = new LocalPokemonRepository();
let init = false;

async function ensure() {
  if (!init) {
    await repo.init().catch(() => {});
    init = true;
  }
}

export function ResultComparison() {
  const build = useBuild();
  const results = useOptimizerResults();
  const objective = useObjective();
  const [baseStats, setBaseStats] = useState<Record<StatName, number> | null>(
    null,
  );

  useEffect(() => {
    if (!build.pokemonId) return;
    ensure().then(() =>
      repo
        .getById(build.pokemonId)
        .then((p) => {
          const data = p as unknown as PokemonData;
          setBaseStats(
            (data?.baseStats ?? null) as Record<StatName, number> | null,
          );
        })
        .catch(() => {}),
    );
  }, [build.pokemonId]);

  if (!baseStats) return null;

  let optimizedEVs: EVDistribution | null = null;
  let highlight: StatName | undefined;

  if (
    objective.type === "speed" &&
    results.speed?.solution !== null &&
    results.speed?.solution !== undefined
  ) {
    optimizedEVs = build.evsActuales.with(
      "speed",
      results.speed.solution as number,
    );
    highlight = "speed";
  } else if (
    objective.type === "damage" &&
    results.damage?.solution !== null &&
    results.damage?.solution !== undefined
  ) {
    optimizedEVs = build.evsActuales.with(
      objective.offensiveStat as StatName,
      results.damage.solution as number,
    );
    highlight = objective.offensiveStat as StatName;
  } else if (objective.type === "survival" && results.survival?.solution) {
    const sol = results.survival.solution;
    let evs = build.evsActuales.with("hp", sol.hp);
    if (sol.defense !== undefined) evs = evs.with("defense", sol.defense);
    if (sol.specialDefense !== undefined)
      evs = evs.with("special-defense", sol.specialDefense);
    optimizedEVs = evs;
    highlight =
      objective.defenseStat === "defense" ? "defense" : "special-defense";
  }

  if (!optimizedEVs) return null;

  const comparison = compareEVDistributions(build.evsActuales, optimizedEVs);

  const diffText = comparison.diffs.length
    ? `Ahorro neto ${comparison.ahorro} EVs. Cambios: ${comparison.diffs
        .map((d) => `${d.stat} ${d.original}→${d.optimizado}`)
        .join(", ")}. Libres tras optimización ${comparison.libres}.`
    : `Sin cambios: distribución ya óptima. Libres ${comparison.libres}.`;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <BuildPreview
          pokemonId={build.pokemonId}
          evs={build.evsActuales}
          baseStats={baseStats}
          ivs={build.fijos.ivs}
          nature={build.fijos.naturaleza}
          level={build.contexto.nivel}
          generation={build.contexto.generacion}
          title={`Original • #${build.pokemonId}`}
          highlightStat={highlight}
        />
        <BuildPreview
          pokemonId={build.pokemonId}
          evs={optimizedEVs}
          baseStats={baseStats}
          ivs={build.fijos.ivs}
          nature={build.fijos.naturaleza}
          level={build.contexto.nivel}
          generation={build.contexto.generacion}
          title={`Optimizada • #${build.pokemonId}`}
          highlightStat={highlight}
        />
      </div>
      <div className="rounded-lg border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2">
        <p className="text-[11px] leading-relaxed text-zinc-700">{diffText}</p>
        <p className="mt-1 text-[10px] text-zinc-500">
          Original {comparison.originalTotal} EVs → Optimizada{" "}
          {comparison.optimizedTotal} EVs
        </p>
      </div>
    </div>
  );
}
