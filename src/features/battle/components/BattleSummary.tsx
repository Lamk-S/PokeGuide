"use client";
import { memo, useMemo } from "react";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import {
  extractTypeName,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";

interface BattleSummaryProps {
  attackerPokemon?: Pokemon | undefined;
  defenderPokemon?: Pokemon | undefined;
  attackerLevel?: number | undefined;
  defenderLevel?: number | undefined;
  generation: number;
}

export const BattleSummary = memo(function BattleSummary({
  attackerPokemon,
  defenderPokemon,
  attackerLevel,
  defenderLevel,
  generation: _generation,
}: BattleSummaryProps) {
  const attackerTypes = useMemo(
    () =>
      (attackerPokemon?.types
        ?.map((t) => extractTypeName(t as PokemonTypeRef))
        .filter(Boolean) as string[]) || [],
    [attackerPokemon],
  );
  const defenderTypes = useMemo(
    () =>
      (defenderPokemon?.types
        ?.map((t) => extractTypeName(t as PokemonTypeRef))
        .filter(Boolean) as string[]) || [],
    [defenderPokemon],
  );

  return (
    <div className="w-full bg-white rounded-2xl border border-[#E0E6EE] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-linear-to-r from-[#FBFCFD] via-white to-[#FBFCFD]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-10 rounded-full bg-white border border-[#E0E6EE] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {attackerPokemon ? (
              <PokemonSprite
                pokemon={{ id: attackerPokemon.id, name: attackerPokemon.name }}
                size={32}
              />
            ) : (
              <span className="text- text-[#7B8794]">?</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text- font-semibold truncate">
                {attackerPokemon
                  ? formatPokemonDisplayName(attackerPokemon.name)
                  : "Sin atacante"}
              </span>
              {attackerPokemon && (
                <span className="size-3.5 rounded-full bg-[#22C55E] flex items-center justify-center text- text-white">
                  ✔
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text- text-[#5F6B7A] tabular-nums">
                Nv. {attackerLevel ?? 50}
              </span>
              {attackerTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center">
          <div className="h-6 px-2 rounded-full bg-[#182033] text-white text- font-bold tracking-wide flex items-center justify-center">
            VS
          </div>
        </div>

        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <div className="min-w-0 text-right">
            <div className="text- font-semibold truncate text-right">
              {defenderPokemon
                ? formatPokemonDisplayName(defenderPokemon.name)
                : "Sin defensor"}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap justify-end">
              {defenderTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
              <span className="text- text-[#5F6B7A] tabular-nums">
                Nv. {defenderLevel ?? 50}
              </span>
            </div>
          </div>
          <div className="size-10 rounded-full bg-white border border-[#E0E6EE] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {defenderPokemon ? (
              <PokemonSprite
                pokemon={{ id: defenderPokemon.id, name: defenderPokemon.name }}
                facing="right"
                size={32}
              />
            ) : (
              <span className="text- text-[#7B8794]">?</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
