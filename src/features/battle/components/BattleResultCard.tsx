"use client";
import { memo, useMemo } from "react";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { BattleScenario } from "@/domain/battle/entities/BattleScenario";
import { TypeBadge } from "@/components/ui/TypeBadge";
import {
  extractTypeName,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";

interface Props {
  result: BattleResult;
  attackerPokemon?: Pokemon;
  defenderPokemon?: Pokemon;
  attackerInput?: BattleParticipantInput | null;
  defenderInput?: BattleParticipantInput | null;
  conditions?: BattleScenario["conditions"];
  moveName?: string | undefined;
  moveType?: string | undefined;
  movePower?: number | null | undefined;
}

export const BattleResultCard = memo(function BattleResultCard({
  result,
  attackerPokemon,
  defenderPokemon,
  attackerInput,
  defenderInput,
  conditions,
  moveName,
  moveType,
  movePower,
}: Props) {
  const percentText = `${result.damage.minPercent}% - ${result.damage.maxPercent}%`;
  const remainingMax = Math.max(0, 100 - result.damage.minPercent);
  const remainingMin = Math.max(0, 100 - result.damage.maxPercent);

  const attackerLine = useMemo(() => {
    if (!attackerInput) return null;
    const evs = attackerInput.evs as unknown as Record<string, number>;
    const total = Object.values(evs).reduce((a, b) => a + (b || 0), 0);
    return `${attackerInput.nature.name} • ${total} EVs • ${attackerInput.ability || "Sin hab."} ${attackerInput.item ? ` @ ${attackerInput.item}` : ""}`;
  }, [attackerInput]);

  const defenderLine = useMemo(() => {
    if (!defenderInput) return null;
    const evs = defenderInput.evs as unknown as Record<string, number>;
    const total = Object.values(evs).reduce((a, b) => a + (b || 0), 0);
    return `${defenderInput.nature.name} • ${total} EVs • ${defenderInput.ability || "Sin hab."} ${defenderInput.item ? ` @ ${defenderInput.item}` : ""}`;
  }, [defenderInput]);

  return (
    <div className="bg-white rounded-2xl border border-[#D9E0E8] shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-linear-to-br from-[#FBFCFD] to-white flex items-center justify-between">
        <h3 className="text- font-semibold tracking-wide">Resultado</h3>
        <span className="text- text-[#7B8794] rounded-full bg-[#F0F3F7] px-2 py-0.5">
          HP defensor: {result.defenderMaxHp}
        </span>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text- font-bold tracking-tight leading-none">
              {result.damage.minDamage}-{result.damage.maxDamage}
            </span>
            <span className="text- text-[#5F6B7A]">puntos de daño</span>
            <span className="ml-auto text- font-semibold px-2.5 py-1 rounded-full bg-[#182033] text-white tabular-nums">
              {percentText}
            </span>
          </div>
          {moveName && (
            <div className="mt-2 flex items-center gap-2 text-">
              <span className="font-medium">{moveName}</span>
              {moveType && <TypeBadge type={moveType} size="sm" />}
              {typeof movePower === "number" && (
                <span className="text-[#5F6B7A]">{movePower} potencia</span>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between text- text-[#5F6B7A] mb-1.5 tabular-nums">
            <span>Vida restante</span>
            <span>
              {remainingMin.toFixed(1)}% - {remainingMax.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#E8ECF1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#182033] rounded-full transition-all"
              style={{ width: `${remainingMax}%` }}
            />
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border text- leading-snug ${result.damage.maxDamage === 0 ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]" : result.koAnalysis.guaranteed ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]" : "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"}`}
        >
          <div className="font-semibold">
            {result.damage.maxDamage === 0
              ? "Inmune - no hace daño"
              : result.koAnalysis.guaranteed
                ? `${result.koAnalysis.hitsToKO}HKO garantizado`
                : `${result.koAnalysis.hitsToKO}HKO • ${result.koAnalysis.probability}% probabilidad`}
          </div>
          <div className="mt-1 opacity-80">{result.explanation.summary}</div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl border bg-[#FBFCFD]">
            <div className="text- uppercase tracking-wide text-[#7B8794]">
              Efectividad
            </div>
            <div className="text- font-semibold mt-1">{moveType || "-"}</div>
            <div className="text- text-[#5F6B7A] mt-0.5">
              {result.explanation.activeModifiers.find((m) =>
                m.includes("STAB"),
              )
                ? "STAB activo"
                : "Sin STAB"}
            </div>
          </div>
          <div className="p-3 rounded-xl border bg-[#FBFCFD]">
            <div className="text- uppercase tracking-wide text-[#7B8794]">
              Clima / Campo
            </div>
            <div className="text- font-medium mt-1 truncate">
              {conditions?.weather && conditions.weather !== "none"
                ? conditions.weather
                : "Sin clima"}
            </div>
            <div className="text- font-medium truncate">
              {conditions?.terrain && conditions.terrain !== "none"
                ? conditions.terrain
                : "Sin campo"}
            </div>
          </div>
          <div className="p-3 rounded-xl border bg-[#FBFCFD]">
            <div className="text- uppercase tracking-wide text-[#7B8794]">
              Crítico / Estado
            </div>
            <div className="text- font-semibold mt-1">
              {conditions?.isCriticalHit ? "Crítico 6.25%" : "Normal"}
            </div>
            <div className="text- text-[#5F6B7A] mt-0.5 truncate">
              {attackerInput?.status && attackerInput.status !== "none"
                ? attackerInput.status
                : "Sin estado"}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#F0F3F7]">
          <div>
            <div className="text- font-semibold uppercase tracking-wide text-[#5F6B7A]">
              Atacante • {attackerPokemon?.name || "Atacante"}
            </div>
            <div className="text- text-[#182033] mt-1">{attackerLine}</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {attackerPokemon?.types?.map((t) => {
                const tn = extractTypeName(t as PokemonTypeRef);
                return <TypeBadge key={tn} type={tn} size="sm" />;
              })}
            </div>
          </div>
          <div>
            <div className="text- font-semibold uppercase tracking-wide text-[#5F6B7A]">
              Defensor • {defenderPokemon?.name || "Defensor"}
            </div>
            <div className="text- text-[#182033] mt-1">{defenderLine}</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {defenderPokemon?.types?.map((t) => {
                const tn = extractTypeName(t as PokemonTypeRef);
                return <TypeBadge key={tn} type={tn} size="sm" />;
              })}
            </div>
          </div>
        </div>

        {result.explanation.activeModifiers.length > 0 && (
          <div>
            <div className="text- uppercase tracking-wide text-[#7B8794] mb-2">
              Modificadores aplicados
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.explanation.activeModifiers.map((m) => (
                <span
                  key={m}
                  className="text- px-2.5 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function ResultEmptyState({ missing }: { missing: string[] }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-[#D0D8E2] p-8 text-center">
      <div className="text- font-medium">Falta {missing.join(", ")}</div>
      <div className="text- text-[#7B8794] mt-1.5">
        Completa atacante, defensor y movimiento para calcular el daño real
      </div>
    </div>
  );
}
