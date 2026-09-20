"use client";
import { Target, Swords, ShieldAlert, Sparkles, Info } from "lucide-react";
import type { BattleResult } from "@/domain/battle/types/BattleTypes";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";

interface Props {
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
}: Props) {
  const { abilityList } = useAbilityStore();
  const { itemList } = useItemStore();

  const { minDamage, maxDamage, minPercent, maxPercent } = result.damage;
  const barWidth = Math.min(100, Math.max(0, maxPercent));

  const formattedAttacker = formatPokemonDisplayName(attackerName);
  const formattedDefender = formatPokemonDisplayName(defenderName);

  const getBarColor = () => {
    if (maxPercent >= 100) return "bg-red-500";
    if (maxPercent >= 70) return "bg-orange-500";
    if (maxPercent >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const translate = (label: string, raw: string) => {
    if (label.includes("Habilidad")) {
      const m = abilityList.find((a) => a.name === raw);
      return m ? `${m.nameEs} (${raw})` : raw;
    }
    if (label.includes("Objeto")) {
      const m = itemList.find((i) => i.name === raw);
      return m ? `${m.nameEs} (${raw})` : raw;
    }
    return raw;
  };

  const koText = () => {
    const { hitsToKO, guaranteed, probability } = result.koAnalysis;
    if (hitsToKO === 0) return "No puede hacer KO";
    if (hitsToKO === 1) {
      return guaranteed
        ? `OHKO Garantizado (${probability}%)`
        : `OHKO ${probability}% de prob.`;
    }
    return guaranteed
      ? `${hitsToKO}HKO Garantizado (${probability}%)`
      : `${hitsToKO}HKO con ${probability}% de probabilidad`;
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-bottom-2 space-y-5">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Target className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-black tracking-tight">Análisis de Daño</h3>
      </div>

      <div className="text-sm flex flex-wrap items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
        <span
          className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-"
          title={formattedAttacker}
        >
          {formattedAttacker}
        </span>
        <span>usa</span>
        <span className="bg-zinc-900 text-white dark:bg-white dark:text-black px-2.5 py-0.5 rounded-full text-xs font-bold capitalize flex items-center gap-1">
          <Swords className="w-3 h-3" />
          {moveName}
        </span>
        <span>contra</span>
        <span
          className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-"
          title={formattedDefender}
        >
          {formattedDefender}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tabular-nums">
            {minDamage} - {maxDamage}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            HP
          </span>
          <span
            className={`text-lg font-bold ml-2 ${maxPercent >= 70 ? "text-red-600" : "text-zinc-600"}`}
          >
            ({minPercent}% - {maxPercent}%)
          </span>
        </div>
        <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${getBarColor()}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1.5">
          HP del defensor: {result.defenderMaxHp} • Rango de 16 rolls de daño
        </p>
      </div>

      <div
        className={`flex gap-3 rounded-lg p-3 border ${result.koAnalysis.guaranteed ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"}`}
      >
        <ShieldAlert
          className={`w-5 h-5 shrink-0 mt-0.5 ${result.koAnalysis.guaranteed ? "text-green-600" : "text-amber-600"}`}
        />
        <div>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {koText()}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            {result.explanation.summary}
          </p>
        </div>
      </div>

      {result.explanation.activeModifiers.length > 0 && (
        <div>
          <h4 className="text- font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Modificadores Activos
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {result.explanation.activeModifiers.map((mod) => (
              <span
                key={mod}
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium"
              >
                {mod}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.explanation.context.length > 0 && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text- font-bold uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Contexto del Combate
          </h4>
          <ul className="space-y-1.5">
            {result.explanation.context.map((ctx) => (
              <li
                key={`${ctx.label}-${ctx.value}`}
                className="text-xs flex gap-2"
              >
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 min-w- truncate">
                  {ctx.label}:
                </span>
                <span className="text-zinc-600 dark:text-zinc-400 capitalize truncate">
                  {translate(ctx.label, ctx.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
