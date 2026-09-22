"use client";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";

interface BattleResultCardProps {
  result: BattleResult;
  attackerName: string;
  defenderName: string;
  moveName: string;
}

export function BattleResultCard({
  result,
  attackerName,
  defenderName,
  moveName,
}: BattleResultCardProps) {
  const attackerDisplay = formatPokemonDisplayName(attackerName);
  const defenderDisplay = formatPokemonDisplayName(defenderName);

  const { damage, koAnalysis, explanation, defenderMaxHp } = result;

  return (
    <div className="bg-white rounded-[10px] border border-[#D9E0E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-4 border-b border-[#F0F3F7] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#182033]">Resultado</h3>
        <span aria-live="polite" className="text-[11px] text-[#7B8794]">
          HP defensor: {defenderMaxHp}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <div className="flex items-baseline gap-3">
          <span className="text-[28px] font-bold tabular-nums tracking-[-0.02em] text-[#182033]">
            {damage.minDamage}-{damage.maxDamage}
          </span>
          <span className="text-[13px] text-[#5F6B7A]">puntos de daño</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#5F6B7A]">Vida restante</span>
            <span className="font-medium tabular-nums text-[#182033]">
              {damage.minPercent.toFixed(1)}% - {damage.maxPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#E6EBF1] overflow-hidden">
            <div
              className="h-full bg-[#182033] rounded-full transition-all"
              style={{ width: `${Math.min(100, damage.maxPercent)}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#ECFDF5] border border-[#B7E4CE] p-3">
          <div className="text-xs font-semibold text-[#065F46]">
            {koAnalysis.hitsToKO}HKO{" "}
            {koAnalysis.guaranteed
              ? "garantizado"
              : `(${(koAnalysis.probability * 100).toFixed(1)}%)`}
          </div>
          <div className="text-[11px] text-[#047857] mt-1">
            Con {moveName} · {explanation.summary}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {explanation.context.slice(0, 3).map((ctx) => (
            <div
              key={ctx.label}
              className="rounded-md bg-[#F5F7FA] border border-[#E6EBF1] p-2"
            >
              <div className="text-[#7B8794]">{ctx.label}</div>
              <div className="font-medium text-[13px] mt-0.5 text-[#182033] truncate">
                {ctx.value}
              </div>
            </div>
          ))}
          {explanation.context.length === 0 && (
            <>
              <div className="rounded-md bg-[#F5F7FA] border border-[#E6EBF1] p-2">
                <div className="text-[#7B8794]">Efectividad</div>
                <div className="font-medium text-[13px] mt-0.5 text-[#182033]">
                  —
                </div>
              </div>
              <div className="rounded-md bg-[#F5F7FA] border border-[#E6EBF1] p-2">
                <div className="text-[#7B8794]">Clima</div>
                <div className="font-medium text-[13px] mt-0.5 text-[#182033]">
                  —
                </div>
              </div>
              <div className="rounded-md bg-[#F5F7FA] border border-[#E6EBF1] p-2">
                <div className="text-[#7B8794]">Crítico</div>
                <div className="font-medium text-[13px] mt-0.5 text-[#182033]">
                  6.25%
                </div>
              </div>
            </>
          )}
        </div>

        {explanation.activeModifiers.length > 0 && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#7B8794]">
              Modificadores aplicados
            </div>
            <div className="flex flex-wrap gap-1.5">
              {explanation.activeModifiers.map((mod) => (
                <span
                  key={mod}
                  className="text-[11px] px-2 py-1 rounded-full bg-[#F0F3F7] border border-[#E6EBF1] text-[#5F6B7A]"
                >
                  {mod}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-[11px] text-[#7B8794] border-t border-[#F0F3F7] pt-3">
          {attackerDisplay} usa {moveName} contra {defenderDisplay} -{" "}
          {damage.minDamage}-{damage.maxDamage} ({damage.minPercent.toFixed(1)}
          %-{damage.maxPercent.toFixed(1)}%)
        </div>
      </div>
    </div>
  );
}

export function ResultEmptyState({ missing }: { missing: string[] }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#D9E0E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-8 flex flex-col items-center text-center">
      <div className="size-12 rounded-[10px] bg-[#F0F3F7] flex items-center justify-center mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="text-[#7B8794]"
          aria-hidden="true"
        >
          <title>Check</title>
          <path
            d="M9 11l3 3L22 4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#182033]">
        Completa el atacante, el defensor y el movimiento para calcular el
        resultado.
      </p>
      <p className="text-xs text-[#7B8794] mt-1 max-w-80">
        Selecciona ambos Pokémon, elige un movimiento y ejecuta el cálculo. El
        análisis mostrará daño, porcentaje de vida y probabilidades de KO.
      </p>
      {missing.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {missing.map((m) => (
            <span
              key={m}
              className="text-[11px] px-2 py-1 rounded-full bg-[#FFFBEB] border border-[#F6E6B8] text-[#A96B00]"
            >
              Falta: {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
