"use client";
import { memo, useMemo } from "react";
import { translateTypeUpper } from "@/components/ui/TypeBadge";
import {
  getAbilityDetailEs,
  getItemDetailEs,
  getStatusDetailEs,
  getTerrainDetailEs,
  getWeatherDetailEs,
} from "@/domain/battle/services/BattleModifiersTranslator";
import { VALIDATION_ES } from "@/domain/battle/services/BattleValidation.es";
import type {
  BattleResult,
  IBattleConditions,
} from "@/domain/battle/types/BattleParticipant";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import { useItemStore } from "@/features/items/store/useItemStore";

type PokemonLike =
  | { id?: number; name?: string; types?: unknown[] }
  | null
  | undefined;

interface Props {
  readonly result: BattleResult | null;
  readonly attackerPokemon?: PokemonLike | undefined;
  readonly defenderPokemon?: PokemonLike | undefined;
  readonly attackerInput?: BattleParticipantInput | null | undefined;
  readonly defenderInput?: BattleParticipantInput | null | undefined;
  readonly conditions?: IBattleConditions | null | undefined;
  readonly moveName?: string | undefined;
  readonly moveType?: string | undefined;
  readonly movePower?: number | null | undefined;
  readonly generation?: number | undefined;
  readonly error?: string | null | undefined;
}

interface EmptyProps {
  readonly missing?: string[] | undefined;
}

function getName(p: PokemonLike): string | null {
  if (!p) return null;
  const raw = (p as { name?: string }).name;
  return raw ? formatPokemonDisplayName(raw) : null;
}

function getEvTotalFromInput(
  input: BattleParticipantInput | null | undefined,
): number {
  if (!input) return 0;
  const evs = (input as { evs?: Record<string, number> }).evs;
  if (!evs) return 0;
  return Object.values(evs).reduce((a: number, b: number) => a + (b ?? 0), 0);
}

function translateMissingLabel(code: string): string {
  return VALIDATION_ES[code] ?? code.replace(/_/g, " ").toLowerCase();
}

export function ResultEmptyState({ missing }: EmptyProps) {
  const translated =
    missing && missing.length > 0 ? missing.map(translateMissingLabel) : [];
  return (
    <div className="bg-[#FFFEFB] rounded-2xl border border-dashed border-[#EDE8E0] p-8 text-center min-h-72 flex flex-col items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-3 text-[13px] leading-normal text-[#7A7570] max-w-[32ch]">
        {translated.length > 0
          ? `Falta: ${translated.join(" · ")}. Completa atacante, defensor y movimiento.`
          : "Selecciona atacante, defensor y movimiento y presiona Calcular daño."}
      </p>
      <p className="mt-3 text-[10px] font-mono text-[#9A9590]">
        El primer cálculo es manual, luego se actualiza automático.
      </p>
    </div>
  );
}

export function ResultErrorState({ error }: { readonly error: string }) {
  return (
    <div className="bg-[#FFFEFB] rounded-2xl border border-[#EDE8E0] p-8 text-center shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9A9590]">
        Daño estimado
      </div>
      <p className="mt-3 text-[13px] leading-normal text-[#991B1B]">{error}</p>
    </div>
  );
}

export const BattleResultCard = memo(function BattleResultCard({
  result,
  attackerPokemon,
  defenderPokemon,
  attackerInput,
  defenderInput,
  conditions,
  moveName = "Movimiento",
  moveType,
  movePower,
  generation = 9,
}: Props) {
  const itemList = useItemStore((s) => s.itemList) as Array<{
    name: string;
    nameEs: string;
    id?: string;
  }>;
  const attackerName = getName(attackerPokemon) ?? "Atacante";
  const defenderName = getName(defenderPokemon) ?? "Defensor";

  const minDmg = result?.damage.minDamage ?? 0;
  const maxDmg = result?.damage.maxDamage ?? 0;
  const minPct = result?.damage.minPercent ?? 0;
  const maxPct = result?.damage.maxPercent ?? 0;
  const defenderHp = result?.defenderMaxHp ?? 0;
  const remainingMax = Math.max(0, 100 - minPct);
  const remainingMin = Math.max(0, 100 - maxPct);
  const isGuaranteed = result
    ? result.koAnalysis.guaranteed || minPct >= 100
    : false;
  const isPossible = result ? !isGuaranteed && maxPct >= 100 : false;
  const hits = result?.koAnalysis.hitsToKO ?? 0;
  const prob = result?.koAnalysis.probability ?? 0;

  const koExplain = useMemo(() => {
    if (!result) return "";
    if (isGuaranteed)
      return `Roll mínimo (${minDmg}) ya hace ${minPct.toFixed(1)}% > 100% de ${defenderHp} PS. Los 16 rolls (85%-100%) matan.`;
    if (isPossible)
      return `Min ${minPct.toFixed(1)}% no mata, max ${maxPct.toFixed(1)}% sí. ${prob.toFixed(0)}% de rolls son KO → ${hits}HKO con chance.`;
    return `Max ${maxDmg} / ${maxPct.toFixed(1)}% no alcanza 100%. Necesita ${hits} golpes.`;
  }, [
    result,
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
    if (!result) return "Neutro (1x)";
    const eff =
      (result as BattleResult & { effectiveness?: number }).effectiveness ?? 1;
    if (eff === 0) return "Inmune (0x)";
    if (eff === 0.25) return "Doble resistencia (0.25x)";
    if (eff === 0.5) return "Resistido (0.5x)";
    if (eff === 1) return "Neutro (1x)";
    if (eff === 2) return "Súper eficaz (2x)";
    if (eff === 4) return "Doble debilidad (4x)";
    return `${eff}x`;
  }, [result]);

  const weatherNote = useMemo(() => {
    if (!conditions) return null;
    const w = conditions.weather;
    if (!w || w === "none") return null;
    const detail = getWeatherDetailEs(w);
    return `${detail.label} ${detail.effect}`;
  }, [conditions]);
  const terrainNote = useMemo(() => {
    if (!conditions) return null;
    const t = conditions.terrain;
    if (!t || t === "none") return null;
    const detail = getTerrainDetailEs(t);
    return `${detail.label} ${detail.effect}`;
  }, [conditions]);

  const attackerStatusDetail = useMemo(
    () => getStatusDetailEs(attackerInput?.status),
    [attackerInput?.status],
  );
  const defenderStatusDetail = useMemo(
    () => getStatusDetailEs(defenderInput?.status),
    [defenderInput?.status],
  );
  const attackerItemDetail = useMemo(
    () => getItemDetailEs(attackerInput?.item, itemList),
    [attackerInput?.item, itemList],
  );
  const defenderItemDetail = useMemo(
    () => getItemDetailEs(defenderInput?.item, itemList),
    [defenderInput?.item, itemList],
  );
  const abilityList = useAbilityStore((s) => s.abilityList) as Array<{
    name: string;
    nameEs?: string;
    effect?: string;
    effectEs?: string;
    id?: string;
  }>;
  const attackerAbilityDetail = useMemo(
    () => getAbilityDetailEs(attackerInput?.ability, abilityList),
    [attackerInput?.ability, abilityList],
  );
  const defenderAbilityDetail = useMemo(
    () => getAbilityDetailEs(defenderInput?.ability, abilityList),
    [defenderInput?.ability, abilityList],
  );

  const evAtk = getEvTotalFromInput(attackerInput);
  const evDef = getEvTotalFromInput(defenderInput);

  return (
    <div className="space-y-3">
      <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#F0EDE6]">
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
              Daño Mín. / Daño Máx.
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
              PS restante {remainingMin.toFixed(1)}% – {remainingMax.toFixed(1)}
              % · PS {defenderHp}
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
                  ? `${hits}HKO · ${prob.toFixed(0)}% de KO`
                  : `${hits}HKO · no garantiza`}
            </span>
          </div>

          {(attackerStatusDetail ||
            defenderStatusDetail ||
            attackerItemDetail ||
            defenderItemDetail ||
            attackerAbilityDetail ||
            defenderAbilityDetail) && (
            <div className="mt-4 grid grid-cols-1 gap-2">
              {attackerStatusDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {attackerName}: {attackerStatusDetail.label}
                  </span>
                  <span className="text-[#92400E] leading-snug wrap-break-word">
                    · {attackerStatusDetail.effect}
                  </span>
                </div>
              )}
              {defenderStatusDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {defenderName}: {defenderStatusDetail.label}
                  </span>
                  <span className="text-[#991B1B] leading-snug wrap-break-word">
                    · {defenderStatusDetail.effect}
                  </span>
                </div>
              )}
              {attackerItemDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {attackerName}: {attackerItemDetail.label}
                  </span>
                  <span className="text-[#065F46] leading-snug wrap-break-word">
                    · {attackerItemDetail.effect}
                  </span>
                </div>
              )}
              {defenderItemDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {defenderName}: {defenderItemDetail.label}
                  </span>
                  <span className="text-[#065F46] leading-snug wrap-break-word">
                    · {defenderItemDetail.effect}
                  </span>
                </div>
              )}
              {attackerAbilityDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {attackerName}: {attackerAbilityDetail.label}
                  </span>
                  <span className="text-[#1E40AF] leading-snug wrap-break-word">
                    · {attackerAbilityDetail.effect}
                  </span>
                </div>
              )}
              {defenderAbilityDetail && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[11px] rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-2">
                  <span className="font-semibold shrink-0">
                    {defenderName}: {defenderAbilityDetail.label}
                  </span>
                  <span className="text-[#1E40AF] leading-snug wrap-break-word">
                    · {defenderAbilityDetail.effect}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#111]">
              ¿Por qué?
            </div>
            <p className="mt-1.5 text-[12px] leading-normal text-[#2B2B2B] wrap-break-word">
              {koExplain}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex min-h-5 items-center px-2 py-0.5 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E] leading-tight">
                {effectivenessNote}
              </span>
              <span className="inline-flex min-h-5 items-center px-2 py-0.5 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E] leading-tight">
                STAB 1.5x si tipo coincide
              </span>
              {weatherNote && (
                <span className="inline-flex min-h-5 items-center px-2 py-0.5 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E] leading-tight wrap-break-word max-w-full">
                  {weatherNote}
                </span>
              )}
              {terrainNote && (
                <span className="inline-flex min-h-5 items-center px-2 py-0.5 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E] leading-tight wrap-break-word max-w-full">
                  {terrainNote}
                </span>
              )}
              <span
                title="Fórmula oficial: 16 valores aleatorios del 85% al 100%"
                className="inline-flex min-h-5 items-center px-2 py-0.5 rounded-full bg-white border border-[#EDE8E0] text-[10px] font-mono text-[#57534E] leading-tight"
              >
                16 rolls · 85% a 100%
              </span>
            </div>
            <p className="mt-2 text-[9px] font-mono text-[#9A9590] leading-snug">
              * 16 rolls es fijo por mecánica de juego: cada ataque tiene 16
              variaciones de daño (85% a 100%). No es configurable.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-[#EDE8E0] bg-white px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#9A9590] tabular-nums">
        <span>
          {evAtk}/510 Esfuerzo atacante - {attackerName}
        </span>
        <span>{evDef}/510 Defensor</span>
        <span className="ml-auto">PS RESTANTE {remainingMin.toFixed(1)}%</span>
      </div>
    </div>
  );
});
