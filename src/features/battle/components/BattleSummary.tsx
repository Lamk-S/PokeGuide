"use client";
import { memo, useMemo } from "react";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeBadge, translateTypeUpper } from "@/components/ui/TypeBadge";
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
  moveName?: string | undefined;
  moveType?: string | undefined;
  movePower?: number | null | undefined;
}

export const BattleSummary = memo(function BattleSummary({
  attackerPokemon,
  defenderPokemon,
  attackerLevel,
  defenderLevel,
  moveName,
  moveType,
  movePower,
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
    <div className="w-full border-y border-[#EDE8E0] bg-[#FFFEFB]">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6 h-17 flex items-center justify-between gap-3">
        {/* Attacker */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-9 rounded-full bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center overflow-hidden shrink-0">
            {attackerPokemon ? (
              <PokemonSprite
                pokemon={{ id: attackerPokemon.id, name: attackerPokemon.name }}
                size={32}
              />
            ) : (
              <span className="text-[12px] text-[#9A9590]">?</span>
            )}
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold tracking-[-0.01em] truncate">
                {attackerPokemon
                  ? formatPokemonDisplayName(attackerPokemon.name)
                  : "Sin atacante"}
              </span>
              <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
                Nv. {attackerLevel ?? 50}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {attackerTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
              {!attackerTypes.length && (
                <span className="text-[10px] text-[#9A9590]">—</span>
              )}
            </div>
          </div>
          {/* mobile only name */}
          <span className="sm:hidden text-[13px] font-bold truncate">
            {attackerPokemon
              ? formatPokemonDisplayName(attackerPokemon.name)
              : "Atacante"}
          </span>
        </div>

        {/* Center VS + Move */}
        <div className="shrink-0 flex flex-col items-center justify-center min-w-0">
          <span className="text-[10px] font-mono tracking-widest text-[#9A9590] uppercase leading-none">
            VS
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[13px] font-semibold tracking-[-0.01em] truncate max-w-45 lg:max-w-65">
              {moveName || "Sin movimiento"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#9A9590] mt-0.5 tabular-nums">
            {movePower ? `${movePower} pot.` : ""}{" "}
            {moveType ? `• ${translateTypeUpper(moveType)}` : ""}
          </span>
        </div>

        {/* Defender */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <span className="sm:hidden text-[13px] font-bold truncate text-right">
            {defenderPokemon
              ? formatPokemonDisplayName(defenderPokemon.name)
              : "Defensor"}
          </span>
          <div className="min-w-0 hidden sm:block text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
                Nv. {defenderLevel ?? 50}
              </span>
              <span className="text-[13px] font-bold tracking-[-0.01em] truncate">
                {defenderPokemon
                  ? formatPokemonDisplayName(defenderPokemon.name)
                  : "Sin defensor"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 justify-end">
              {defenderTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
              {!defenderTypes.length && (
                <span className="text-[10px] text-[#9A9590]">—</span>
              )}
            </div>
          </div>
          <div className="size-9 rounded-full bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center overflow-hidden shrink-0">
            {defenderPokemon ? (
              <PokemonSprite
                pokemon={{ id: defenderPokemon.id, name: defenderPokemon.name }}
                facing="right"
                size={32}
              />
            ) : (
              <span className="text-[12px] text-[#9A9590]">?</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
