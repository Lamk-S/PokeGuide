"use client";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";

interface BattleSummaryProps {
  attackerPokemon: Pokemon | undefined;
  defenderPokemon: Pokemon | undefined;
  attackerInput: BattleParticipantInput | null;
  defenderInput: BattleParticipantInput | null;
}

type PokemonTypeRef = { type?: { name?: string } } | string;

function getTypeName(t: PokemonTypeRef): string {
  if (typeof t === "string") return t.charAt(0).toUpperCase() + t.slice(1);
  const name = t.type?.name;
  if (!name) return "Desconocido";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function BattleSummary({
  attackerPokemon,
  defenderPokemon,
  attackerInput,
  defenderInput,
}: BattleSummaryProps) {
  const attackerName = attackerPokemon
    ? formatPokemonDisplayName(attackerPokemon.name)
    : "—";
  const defenderName = defenderPokemon
    ? formatPokemonDisplayName(defenderPokemon.name)
    : "Sin seleccionar";

  return (
    <div className="sticky top-14 z-20 bg-white/90 backdrop-blur-md border-y border-[#D9E0E8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 md:px-6 h-16 md:h-17 flex items-center justify-between gap-2 md:gap-4">
        {/* Atacante */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="size-9 md:size-12 rounded-full bg-[#F0F3F7] border border-[#D9E0E8] flex items-center justify-center overflow-hidden shrink-0">
            {attackerPokemon ? (
              <PokemonSprite
                pokemon={{ id: attackerPokemon.id, name: attackerPokemon.name }}
                facing="left"
                size={32}
                hd={false}
              />
            ) : (
              <span className="text-[#7B8794] text-xs">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] md:text-[15px] font-semibold tracking-[-0.01em] truncate text-[#182033]">
                {attackerName}
              </span>
              {attackerPokemon && (
                <span className="hidden sm:inline-flex size-4 rounded-full bg-[#ECFDF5] text-[#16845B] items-center justify-center">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] md:text-xs text-[#5F6B7A] truncate">
                Nv. {attackerInput?.level ?? 50}
              </span>
              <span className="hidden md:flex items-center gap-1">
                {attackerPokemon?.types?.slice(0, 2).map((t) => {
                  const typeName = getTypeName(t as PokemonTypeRef);
                  return <TypeBadge key={typeName} type={typeName} size="sm" />;
                })}
              </span>
              {/* En móvil solo primera letra del tipo para no distorsionar */}
              <span className="flex md:hidden items-center gap-0.5">
                {attackerPokemon?.types?.slice(0, 1).map((t) => {
                  const typeName = getTypeName(t as PokemonTypeRef);
                  return <TypeBadge key={typeName} type={typeName} size="sm" />;
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-1 px-1">
          <div className="w-7 h-5 md:w-8 md:h-5.5 rounded-full bg-[#182033] text-white flex items-center justify-center text-[10px] md:text-[11px] font-bold tracking-widest">
            VS
          </div>
        </div>

        {/* Defensor */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 justify-end text-right">
          {defenderPokemon ? (
            <>
              <div className="min-w-0 flex-1 md:flex-none order-2 md:order-1">
                <div className="text-[13px] md:text-[15px] font-semibold tracking-[-0.01em] truncate text-[#182033] text-right">
                  {defenderName}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="hidden md:flex items-center gap-1 justify-end">
                    {defenderPokemon?.types?.slice(0, 2).map((t) => {
                      const typeName = getTypeName(t as PokemonTypeRef);
                      return (
                        <TypeBadge key={typeName} type={typeName} size="sm" />
                      );
                    })}
                  </span>
                  <span className="flex md:hidden items-center gap-0.5 justify-end">
                    {defenderPokemon?.types?.slice(0, 1).map((t) => {
                      const typeName = getTypeName(t as PokemonTypeRef);
                      return (
                        <TypeBadge key={typeName} type={typeName} size="sm" />
                      );
                    })}
                  </span>
                  <span className="text-[10px] md:text-xs text-[#5F6B7A] truncate">
                    Nv. {defenderInput?.level ?? 50}
                  </span>
                </div>
              </div>
              <div className="size-9 md:size-12 rounded-full bg-[#F0F3F7] border border-[#D9E0E8] flex items-center justify-center overflow-hidden shrink-0 order-1 md:order-2">
                <PokemonSprite
                  pokemon={{
                    id: defenderPokemon.id,
                    name: defenderPokemon.name,
                  }}
                  facing="right"
                  size={32}
                  hd={false}
                />
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 text-right">
                <div className="text-[13px] md:text-sm font-medium text-[#7B8794] truncate">
                  Sin seleccionar
                </div>
                <div className="text-[10px] md:text-xs text-[#AAB5C4]">
                  Defensor
                </div>
              </div>
              <div className="size-9 md:size-12 rounded-full bg-[#F0F3F7] border border-dashed border-[#B9C4D1] flex items-center justify-center shrink-0">
                <span className="text-base md:text-lg text-[#B9C4D1]">+</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
