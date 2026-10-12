"use client";
import { memo, useMemo } from "react";
import type { BattleResult } from "@/domain/battle/types/BattleParticipant";
import { translateTypeUpper } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";

type PokemonLike =
  | { id?: number; name?: string; types?: unknown[] }
  | null
  | undefined;

interface Props {
  readonly result: BattleResult;
  readonly attackerPokemon?: PokemonLike | undefined;
  readonly defenderPokemon?: PokemonLike | undefined;
  readonly attackerInput?: unknown | null | undefined;
  readonly defenderInput?: unknown | null | undefined;
  readonly conditions?: unknown | undefined;
  readonly moveName?: string | undefined;
  readonly moveType?: string | undefined;
  readonly movePower?: number | null | undefined;
  readonly generation?: number | undefined;
}

interface EmptyProps {
  readonly missing?: string[] | undefined;
}

function getName(p: PokemonLike): string | null {
  if (!p) return null;
  const raw = (p as { name?: string }).name;
  return raw ? formatPokemonDisplayName(raw) : null;
}

function getEvTotal(p: unknown): number {
  const evs = (p as { evs?: Record<string, number> })?.evs;
  if (!evs) return 0;
  return Object.values(evs).reduce((a, b) => a + (b ?? 0), 0);
}

export function ResultEmptyState({ missing }: EmptyProps) {
  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#EDE8E0] p-6 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-2 text-[12px] leading-normal text-[#7A7570]">
        {missing && missing.length > 0
          ? `Falta: ${missing.join(" · ")}. Completa atacante, defensor y movimiento.`
          : "Selecciona atacante, defensor y movimiento para ver el cálculo."}
      </p>
      {missing && missing.length > 0 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {missing.map((m) => (
            <span
              key={m}
              className="inline-flex h-5 px-2 rounded-full bg-[#F8F5F0] border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]"
            >
              {m}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const BattleResultCard = memo(function BattleResultCard({
  result,
  attackerPokemon,
  defenderPokemon,
  moveName = "Movimiento",
  moveType,
  movePower,
  generation = 9,
}: Props) {
  const minDmg = result.damage.minDamage;
  const maxDmg = result.damage.maxDamage;
  const minPct = result.damage.minPercent;
  const maxPct = result.damage.maxPercent;
  const defenderHp = result.defenderMaxHp;

  const remainingMax = Math.max(0, 100 - minPct);
  const remainingMin = Math.max(0, 100 - maxPct);
  const overkillRaw = ((defenderHp - maxDmg) / defenderHp) * 100;
  const overkillMinRaw = ((defenderHp - minDmg) / defenderHp) * 100;

  const isGuaranteed = result.koAnalysis.guaranteed || minPct >= 100;
  const isPossible = !isGuaranteed && maxPct >= 100;
  const hits = result.koAnalysis.hitsToKO;
  const prob = result.koAnalysis.probability;

  const attackerName = getName(attackerPokemon) ?? "Atacante";
  const defenderName = getName(defenderPokemon) ?? "Defensor";

  const koExplain = useMemo(() => {
    if (isGuaranteed)
      return `Roll mínimo (${minDmg}) ya hace ${minPct.toFixed(1)}% > 100% de ${defenderHp} PS. Los 16 rolls (85%-100%) matan.`;
    if (isPossible)
      return `Min ${minPct.toFixed(1)}% no mata, max ${maxPct.toFixed(1)}% sí. ${prob}% de rolls son KO → ${hits}HKO con chance.`;
    return `Max ${maxDmg} / ${maxPct.toFixed(1)}% no alcanza 100%. Necesita ${hits} golpes.`;
  }, [
    isGuaranteed,
    isPossible,
    minDmg,
    maxDmg,
    minPct,
    maxPct,
    defenderHp,
    prob,
    hits,
  ]);

  const effectivenessNote = useMemo(() => {
    const eff = (result as { effectiveness?: number }).effectiveness;
    if (eff === 0) return "Inmune (0x).";
    if (eff === 0.25) return "Doble resistencia (0.25x).";
    if (eff === 0.5) return "Resistido (0.5x).";
    if (eff === 2) return "Súper eficaz (2x).";
    if (eff === 4) return "Doble debilidad (4x).";
    return "Neutro (1x) + STAB 1.5x.";
  }, [result]);

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#F0EDE6]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
            Daño estimado
          </span>
          <span className="text-[10px] font-mono text-[#9A9590]">
            Gen {generation}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold tracking-[-0.03em] font-mono tabular-nums leading-none">
              {minDmg} – {maxDmg}
            </span>
            <span className="text-[13px] font-medium text-[#7A7570]">
              puntos
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#7A7570] leading-snug">
            {moveName} {moveType ? `• ${translateTypeUpper(moveType)}` : ""}{" "}
            {movePower ? `• ${movePower} pot.` : ""} vs.{" "}
            {defenderName.toLowerCase()}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-[#111] text-white text-[11px] font-mono font-semibold tabular-nums">
              {minPct.toFixed(1)}% – {maxPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-[#9A9590] tabular-nums">
              Vida restante {remainingMin.toFixed(1)}% –{" "}
              {remainingMax.toFixed(1)}% · PS {defenderHp}
            </span>
          </div>
          <div
            className={`mt-3 flex items-start gap-1.5 text-[12px] font-medium leading-snug ${isGuaranteed ? "text-[#065F46]" : isPossible ? "text-[#92400E]" : "text-[#7A7570]"}`}
          >
            <span
              className={`mt-1 size-1.5 rounded-full shrink-0 ${isGuaranteed ? "bg-[#065F46]" : isPossible ? "bg-[#D97706]" : "bg-[#9A9590]"}`}
            />
            <span>
              {isGuaranteed
                ? `KO en ${hits} golpe garantizado`
                : isPossible
                  ? `${hits}HKO · ${prob}% de KO`
                  : `${hits}HKO · no garantiza`}
            </span>
          </div>
          <div className="mt-4 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#111]">
              ¿Por qué?
            </div>
            <p className="mt-1.5 text-[12px] leading-normal text-[#2B2B2B]">
              {koExplain}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                {effectivenessNote}
              </span>
              <span className="inline-flex h-5 px-2 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E]">
                16 rolls · 85% a 100%
              </span>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-dashed border-[#D9CFC2] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
              ¿Por qué varía la vida restante?
            </div>
            <p className="mt-1.5 text-[11px] leading-normal text-[#57534E]">
              Daño no fijo: {minDmg} es roll 85% → deja{" "}
              {remainingMax.toFixed(1)}%, {maxDmg} es 100% → deja{" "}
              {remainingMin.toFixed(1)}%. Crudo {overkillMinRaw.toFixed(1)}% a{" "}
              {overkillRaw.toFixed(1)}% = overkill negativo que ves como -39.3%.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[#EDE8E0] bg-white px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#9A9590] tabular-nums">
        <span>
          {getEvTotal(attackerPokemon ?? {})}/510 Atacante · {attackerName}
        </span>
        <span>{getEvTotal(defenderPokemon ?? {})}/510 Defensor</span>
        <span className="ml-auto">
          VIDA RESTANTE {overkillRaw.toFixed(1)}% cruda →{" "}
          {remainingMin.toFixed(1)}% mostrada
        </span>
      </div>
    </div>
  );
});
