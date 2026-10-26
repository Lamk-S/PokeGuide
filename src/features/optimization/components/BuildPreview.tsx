"use client";

import type { StatName } from "@/domain/optimization/types/OptimizationTypes";
import type { EVDistribution } from "@/domain/optimization/value-objects/EVDistribution";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { PokemonSprite } from "@/components/ui/PokemonSprite";

type Props = {
  pokemonId: number;
  evs: EVDistribution;
  baseStats: Record<StatName, number>;
  ivs: Record<StatName, number>;
  nature: {
    name: string;
    nameEs?: string;
    increasedStat: StatName | null;
    decreasedStat: StatName | null;
  };
  level: number;
  generation: number;
  title?: string;
  highlightStat?: StatName;
};

function toCalcNature(n: Props["nature"]) {
  return {
    name: n.name,
    nameEs: n.nameEs ?? n.name,
    increasedStat: n.increasedStat,
    decreasedStat: n.decreasedStat,
  };
}

function StatBadge({
  label,
  value,
  ev,
  highlighted,
}: {
  label: string;
  value: number;
  ev: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white px-2 py-1.5 ${highlighted ? "border-[#111] bg-[#F8F5F0] ring-1 ring-[#111]" : "border-[#E5E2DA]"}`}
    >
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="text-[13px] font-semibold tabular-nums text-[#111]">
        {value}
      </p>
      <p className="text-[10px] tabular-nums text-zinc-500">{ev} EVs</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[#E5E2DA] bg-[#FFFEFB] p-4">
      <p className="text-[11px] text-zinc-500">
        Selecciona un Pokémon para ver la vista previa.
      </p>
    </div>
  );
}

function LoadingStats() {
  const skeletonKeys = [
    "hp-skeleton",
    "atk-skeleton",
    "def-skeleton",
    "spa-skeleton",
    "spd-skeleton",
    "spe-skeleton",
  ] as const;
  return (
    <div className="grid grid-cols-3 gap-2">
      {skeletonKeys.map((key) => (
        <div key={key} className="h-13 animate-pulse rounded-lg bg-zinc-100" />
      ))}
    </div>
  );
}

export function BuildPreview({
  pokemonId,
  evs,
  baseStats,
  ivs,
  nature,
  level,
  generation,
  title = "Propuesta",
  highlightStat,
}: Props) {
  if (!pokemonId || pokemonId === 0) {
    return <EmptyState />;
  }

  if (!evs || !baseStats || !ivs) {
    return (
      <div className="rounded-xl border border-[#E5E2DA] bg-[#FFFEFB] p-4">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          {title}
        </p>
        <div className="mt-3">
          <LoadingStats />
        </div>
      </div>
    );
  }

  const total = evs.total();
  const libres = evs.remaining();
  const isOver = total > 510;

  let stats: Record<StatName, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };

  try {
    const computed = calculateStats({
      baseStats,
      level,
      nature: toCalcNature(nature),
      ivs,
      evs: evs.getAll(),
      generation,
    });
    stats = computed as Record<StatName, number>;
  } catch {}

  return (
    <div className="rounded-xl border border-[#E5E2DA] bg-[#FFFEFB] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          {title}
        </p>
        <p
          className={`text-[10px] tabular-nums ${isOver ? "text-red-500 font-medium" : "text-zinc-500"}`}
        >
          {total}/510 • libres {libres}
        </p>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-[#E5E2DA] bg-white">
            <PokemonSprite
              pokemon={{ id: pokemonId, name: String(pokemonId) }}
              size={56}
            />
          </div>
          <span className="mt-1 text-[10px] text-zinc-500">#{pokemonId}</span>
          <span className="mt-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
            {nature.name}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-2">
          {(Object.keys(stats) as StatName[]).map((s) => (
            <StatBadge
              key={s}
              label={s}
              value={stats[s] ?? 0}
              ev={evs.get(s)}
              highlighted={highlightStat === s}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
