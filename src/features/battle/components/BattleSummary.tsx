"use client";
import { memo, useMemo } from "react";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeBadge, translateTypeUpper } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import {
  extractTypeName,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";

type PokemonLike =
  | { id?: number; name?: string; types?: unknown[] | string[] }
  | null
  | undefined;

interface Props {
  attackerPokemon?: PokemonLike | undefined;
  defenderPokemon?: PokemonLike | undefined;
  attackerLevel?: number | undefined;
  defenderLevel?: number | undefined;
  generation?: number | undefined;
  moveName?: string | undefined;
  moveType?: string | undefined;
  movePower?: number | null | undefined;
}

function getDisplayName(p: PokemonLike | undefined): string | null {
  if (!p) return null;
  const name = (p as { name?: string }).name;
  return name ? formatPokemonDisplayName(name) : null;
}

export const BattleSummary = memo(function BattleSummary({
  attackerPokemon,
  defenderPokemon,
  attackerLevel,
  defenderLevel,
  moveName,
  moveType,
  movePower,
}: Props) {
  const attackerTypes = useMemo(() => {
    const raw = (attackerPokemon as { types?: unknown[] } | null | undefined)
      ?.types;
    if (!raw) return [] as string[];
    return raw
      .map((t) => extractTypeName(t as PokemonTypeRef))
      .filter(Boolean) as string[];
  }, [attackerPokemon]);

  const defenderTypes = useMemo(() => {
    const raw = (defenderPokemon as { types?: unknown[] } | null | undefined)
      ?.types;
    if (!raw) return [] as string[];
    return raw
      .map((t) => extractTypeName(t as PokemonTypeRef))
      .filter(Boolean) as string[];
  }, [defenderPokemon]);

  const attackerDisplay = getDisplayName(attackerPokemon);
  const defenderDisplay = getDisplayName(defenderPokemon);

  return (
    <div className="w-full border-y border-[#EDE8E0] bg-[#FFFEFB]">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-6 h-17 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-9 rounded-full bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center overflow-hidden shrink-0">
            {attackerPokemon?.id ? (
              <PokemonSprite
                pokemon={{
                  id: attackerPokemon.id,
                  name: (attackerPokemon as { name?: string }).name ?? "",
                }}
                size={32}
              />
            ) : (
              <span className="text-[12px] text-[#9A9590]">?</span>
            )}
          </div>
          <div className="min-w-0 hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold tracking-[-0.01em] truncate">
                {attackerDisplay ?? "Sin atacante"}
              </span>
              <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
                Nv. {attackerLevel ?? 50}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {attackerTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
            </div>
          </div>
          <span className="sm:hidden text-[13px] font-bold truncate">
            {attackerDisplay ?? "Atacante"}
          </span>
        </div>

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

        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <span className="sm:hidden text-[13px] font-bold truncate text-right">
            {defenderDisplay ?? "Defensor"}
          </span>
          <div className="min-w-0 hidden sm:block text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
                Nv. {defenderLevel ?? 50}
              </span>
              <span className="text-[13px] font-bold tracking-[-0.01em] truncate">
                {defenderDisplay ?? "Sin defensor"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 justify-end">
              {defenderTypes.map((tn) => (
                <TypeBadge key={tn} type={tn} size="sm" />
              ))}
            </div>
          </div>
          <div className="size-9 rounded-full bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center overflow-hidden shrink-0">
            {defenderPokemon?.id ? (
              <PokemonSprite
                pokemon={{
                  id: defenderPokemon.id,
                  name: (defenderPokemon as { name?: string }).name ?? "",
                }}
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
