"use client";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { StatName } from "@/domain/stats/types/StatTypes";
import { NATURES } from "@/domain/stats/constants/natures";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";
import { StatSliderRow } from "./StatSliderRow";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ParticipantStatsEditorProps {
  input: BattleParticipantInput;
  onChange: (input: BattleParticipantInput) => void;
}

const STAT_LABELS: Record<StatName, { label: string; abbr: string }> = {
  hp: { label: "HP", abbr: "HP" },
  attack: { label: "Ataque", abbr: "Atk" },
  defense: { label: "Defensa", abbr: "Def" },
  "special-attack": { label: "Atq. Esp", abbr: "SpA" },
  "special-defense": { label: "Def. Esp", abbr: "SpD" },
  speed: { label: "Velocidad", abbr: "Spe" },
};
const STAT_KEYS = Object.keys(STAT_LABELS) as StatName[];

export function ParticipantStatsEditor({
  input,
  onChange,
}: ParticipantStatsEditorProps) {
  const currentTotalEVs = EV.calculateTotal(input.evs);
  const remainingEVs = EV.MAX_TOTAL - currentTotalEVs;

  const handleUpdateIV = (stat: StatName, val: number) => {
    const validValue = IV.create(val);
    onChange({ ...input, ivs: { ...input.ivs, [stat]: validValue } });
  };

  const handleUpdateEV = (stat: StatName, val: number) => {
    const validValue = EV.create(val, stat, input.evs);
    onChange({ ...input, evs: { ...input.evs, [stat]: validValue } });
  };

  const handleResetIVs = () =>
    onChange({ ...input, ivs: IV.createPerfectSet() });
  const handleResetEVs = () => onChange({ ...input, evs: EV.createEmptySet() });

  return (
    <div className="mt-4 flex flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      {/* Naturaleza */}
      <div className="flex flex-col gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <Label htmlFor="nature-select" className="text-sm font-semibold">
          Naturaleza
        </Label>
        <select
          id="nature-select"
          value={input.nature.name}
          onChange={(e) => {
            const nat =
              NATURES.find((n) => n.name === e.target.value) || NATURES[0];
            onChange({ ...input, nature: nat });
          }}
          className="h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {NATURES.map((n) => (
            <option key={n.name} value={n.name}>
              {n.nameEs} ({n.name}){" "}
              {n.increasedStat
                ? `· +${STAT_LABELS[n.increasedStat].abbr} / −${n.decreasedStat ? STAT_LABELS[n.decreasedStat].abbr : ""}`
                : "· Neutra"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* IVs Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold tracking-tight">
              IVs (Valores Individuales)
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetIVs}
              className="h-6 text-xs"
            >
              Restablecer 31
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {STAT_KEYS.map((stat) => (
              <StatSliderRow
                key={`iv-${stat}`}
                label={STAT_LABELS[stat].label}
                abbr={STAT_LABELS[stat].abbr}
                value={input.ivs[stat]}
                min={IV.MIN}
                max={IV.MAX}
                onChange={(val) => handleUpdateIV(stat, val)}
                onSetMin={() => handleUpdateIV(stat, IV.MIN)}
                onSetMax={() => handleUpdateIV(stat, IV.MAX)}
              />
            ))}
          </div>
        </div>

        {/* EVs Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold tracking-tight">
              EVs{" "}
              <span
                className={cn(
                  "ml-1 text-xs font-normal",
                  currentTotalEVs === EV.MAX_TOTAL
                    ? "text-green-600 dark:text-green-400 font-bold"
                    : "text-zinc-500",
                )}
              >
                ({currentTotalEVs} / {EV.MAX_TOTAL})
              </span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetEVs}
              className="h-6 text-xs"
            >
              Restablecer 0
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {STAT_KEYS.map((stat) => (
              <StatSliderRow
                key={`ev-${stat}`}
                label={STAT_LABELS[stat].label}
                abbr={STAT_LABELS[stat].abbr}
                value={input.evs[stat]}
                min={EV.MIN}
                max={EV.MAX_STAT}
                totalLimitMax={input.evs[stat] + remainingEVs}
                onChange={(val) => handleUpdateEV(stat, val)}
                onSetMin={() => handleUpdateEV(stat, EV.MIN)}
                onSetMax={() => handleUpdateEV(stat, EV.MAX_STAT)}
              />
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Restantes: {remainingEVs}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
