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
  const total = evs.total();
  const libres = evs.remaining();

  const initialStats: Record<StatName, number> = {
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  };

  let stats: Record<StatName, number> = initialStats;

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
  } catch {
    stats = initialStats;
  }

  return (
    <div className="rounded-xl border border-[#E5E2DA] bg-[#FFFEFB] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          {title}
        </p>
        <p className="text-[10px] tabular-nums text-zinc-500">
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
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {(Object.keys(stats) as StatName[]).map((s) => {
            const isHighlighted = highlightStat === s;
            return (
              <div
                key={s}
                className={`rounded-lg border bg-white px-2 py-1.5 ${
                  isHighlighted
                    ? "border-[#111] bg-[#F8F5F0] ring-1 ring-[#111]"
                    : "border-[#E5E2DA]"
                }`}
              >
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {s}
                </p>
                <p className="text-[13px] font-semibold tabular-nums text-[#111]">
                  {stats[s] ?? 0}
                </p>
                <p className="text-[10px] tabular-nums text-zinc-500">
                  {evs.get(s)} EVs
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
