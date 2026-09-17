"use client";
import { Target, AlertCircle } from "lucide-react";

export interface BattleResultData {
  defenderMaxHp?: number;
  damage: {
    minDamage: number;
    maxDamage: number;
    minPercent: number;
    maxPercent: number;
  };
  koAnalysis: {
    guaranteed: boolean;
    hitsToKO: number;
    probability: number;
  };
  explanation: {
    summary?: string;
    factors: Array<{ label: string }>;
  };
}

interface BattleResultCardProps {
  result: BattleResultData;
  attackerName?: string;
  defenderName?: string;
  moveName?: string;
}

export function BattleResultCard({
  result,
  attackerName = "Atacante",
  defenderName = "Defensor",
  moveName = "Movimiento",
}: BattleResultCardProps) {
  const { minDamage, maxDamage, minPercent, maxPercent } = result.damage;
  const barWidth = Math.min(100, Math.max(0, maxPercent));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Target className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          Análisis de Daño
        </h3>
      </div>

      <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-1.5">
        <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
          {attackerName}
        </span>
        <span>usa</span>
        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-bold capitalize">
          {moveName}
        </span>
        <span>contra</span>
        <span className="font-bold text-zinc-900 dark:text-zinc-100 capitalize">
          {defenderName}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">
          {minDamage} - {maxDamage}
        </span>
        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          HP
        </span>
        <span className="text-lg text-red-600 dark:text-red-400 font-bold ml-2">
          ({minPercent.toFixed(1)}% - {maxPercent.toFixed(1)}%)
        </span>
      </div>

      <div className="mb-5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-full bg-red-500 transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <AlertCircle
          className={`w-5 h-5 shrink-0 ${result.koAnalysis.guaranteed ? "text-green-600" : "text-amber-500"}`}
        />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {result.koAnalysis.guaranteed
            ? "¡KO Garantizado!"
            : "Probabilidad de KO:"}
          <span
            className={`ml-1.5 font-bold ${result.koAnalysis.guaranteed ? "text-green-700 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
          >
            {result.koAnalysis.hitsToKO}HKO ({result.koAnalysis.probability}%)
          </span>
        </p>
      </div>

      {result.explanation.factors.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 mt-3">
            Modificadores (Facts)
          </h4>
          <ul className="flex flex-wrap gap-2">
            {result.explanation.factors.map((factor: { label: string }) => (
              <li
                key={factor.label}
                className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-700 dark:text-zinc-300 font-medium"
              >
                {factor.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
