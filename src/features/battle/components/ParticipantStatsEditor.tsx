"use client";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import { StatSliderRow } from "./StatSliderRow";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";
import { calculateHiddenPower } from "@/domain/stats/services/HiddenPowerService";
import { NATURES } from "@/domain/stats/constants/natures";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

const STAT_ORDER: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
const STAT_ABBR: Record<StatName, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};
const STAT_LABEL: Record<StatName, string> = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Atq. Esp",
  "special-defense": "Def. Esp",
  speed: "Velocidad",
};

const TYPE_COLORS: Record<string, string> = {
  dark: "bg-zinc-800 text-white",
  dragon: "bg-violet-600 text-white",
  fire: "bg-red-500 text-white",
  water: "bg-blue-500 text-white",
  grass: "bg-green-600 text-white",
  electric: "bg-yellow-400 text-black",
  ice: "bg-cyan-300 text-black",
  fighting: "bg-orange-700 text-white",
  poison: "bg-purple-600 text-white",
  ground: "bg-amber-700 text-white",
  flying: "bg-indigo-400 text-white",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-600 text-white",
  rock: "bg-stone-500 text-white",
  ghost: "bg-purple-800 text-white",
  steel: "bg-zinc-400 text-black",
  fairy: "bg-pink-300 text-black",
  normal: "bg-zinc-300 text-black",
};

const EMPTY_IVS = {
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
} as const;
const EMPTY_EVS = {
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
} as const;

interface Props {
  input: BattleParticipantInput;
  onChange: (input: BattleParticipantInput) => void;
  generation: number;
}

export function ParticipantStatsEditor({ input, onChange, generation }: Props) {
  const totalEVs = Object.values(input.evs).reduce(
    (a, b) => a + (b as number),
    0,
  );
  const remainingEVs = 510 - totalEVs;
  const hiddenPower = calculateHiddenPower(input.ivs, generation);

  const handleUpdateIV = (stat: StatName, val: number) => {
    onChange({
      ...input,
      ivs: { ...input.ivs, [stat]: Math.max(0, Math.min(31, val)) },
    });
  };

  const handleUpdateEV = (stat: StatName, val: number) => {
    const clamped = Math.max(0, Math.min(252, val));
    const otherTotal = totalEVs - input.evs[stat];
    const finalVal = Math.min(clamped, 510 - otherTotal);
    onChange({ ...input, evs: { ...input.evs, [stat]: finalVal } });
  };

  const natureOptions = NATURES.map((n) => ({
    value: n.name,
    label: `${n.nameEs} (${n.name})`,
    description: `${n.increasedStat ? `↑${n.increasedStat}` : "Neutra"} ${n.decreasedStat ? `↓${n.decreasedStat}` : ""}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">Naturaleza</Label>
        <Combobox
          options={natureOptions}
          value={input.nature.name}
          onValueChange={(val) => {
            const nat = NATURES.find((n) => n.name === val);
            if (nat) onChange({ ...input, nature: nat });
          }}
          placeholder="Seria (Serious) · Neutra"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-bold">
            IVs (Valores Individuales)
          </Label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onChange({ ...input, ivs: IV.createPerfectSet() })}
              className="text- px-2 py-1 rounded bg-zinc-900 text-white"
            >
              31
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({ ...input, ivs: IV.createSet(EMPTY_IVS) })
              }
              className="text- px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800"
            >
              0
            </button>
          </div>
        </div>
        <div className="space-y-1">
          {STAT_ORDER.map((stat) => (
            <StatSliderRow
              key={`iv-${stat}`}
              label={STAT_LABEL[stat]}
              abbr={STAT_ABBR[stat]}
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

      <div>
        <div className="flex justify-between items-center mb-2">
          <Label className="text-sm font-bold">EVs ({totalEVs} / 510)</Label>
          <span className="text-xs text-zinc-500">
            Restantes: {remainingEVs}
          </span>
        </div>
        <div className="space-y-1">
          {STAT_ORDER.map((stat) => (
            <StatSliderRow
              key={`ev-${stat}`}
              label={STAT_LABEL[stat]}
              abbr={STAT_ABBR[stat]}
              value={input.evs[stat]}
              min={0}
              max={Math.min(252, input.evs[stat] + remainingEVs)}
              totalLimitMax={input.evs[stat] + remainingEVs}
              onChange={(val) => handleUpdateEV(stat, val)}
              onSetMin={() => handleUpdateEV(stat, 0)}
              onSetMax={() =>
                handleUpdateEV(
                  stat,
                  Math.min(252, input.evs[stat] + remainingEVs),
                )
              }
            />
          ))}
        </div>
        <div className="flex gap-1 mt-2">
          <button
            type="button"
            onClick={() => onChange({ ...input, evs: EV.createSet(EMPTY_EVS) })}
            className="text- px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800"
          >
            Limpiar EVs
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400">
          Poder Oculto (Hidden Power)
        </p>
        <p className="text-[11px] text-zinc-500 mb-2">
          Calculado automáticamente a partir de los IVs actuales.
        </p>
        {hiddenPower?.available && hiddenPower.type ? (
          <div className="flex gap-2 items-center">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${TYPE_COLORS[hiddenPower.type] ?? "bg-zinc-200 text-black"}`}
            >
              {hiddenPower.type}
            </span>
            <span className="text-xs font-mono font-bold">
              {hiddenPower.power} BP
            </span>
          </div>
        ) : (
          <span className="text-xs text-zinc-500">
            {hiddenPower?.reason ?? "No disponible en Gen 8+"}
          </span>
        )}
      </div>
    </div>
  );
}
