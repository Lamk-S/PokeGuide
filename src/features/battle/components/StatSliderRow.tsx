"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  label: string;
  abbr: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  onSetMin?: () => void;
  onSetMax?: () => void;
  totalLimitMax?: number;
}

export function StatSliderRow({
  label,
  abbr,
  value,
  min,
  max,
  onChange,
  onSetMin,
  onSetMax,
}: Props) {
  const clamp = (v: number) => Math.max(min, Math.min(max, Math.floor(v)));

  return (
    <div className="flex items-center gap-2 w-full py-1">
      <Label className="w- text-xs">{label}</Label>
      <span className="w-7 text- font-mono text-zinc-500">{abbr}</span>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="flex-1 h-2 cursor-pointer rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-white"
      />

      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="w-14 h-7 text-xs px-1"
      />

      <div className="flex gap-1">
        {onSetMin && (
          <button
            type="button"
            onClick={onSetMin}
            className="h-7 px-1.5 text- rounded bg-zinc-100 dark:bg-zinc-800"
          >
            0
          </button>
        )}
        {onSetMax && (
          <button
            type="button"
            onClick={onSetMax}
            className="h-7 px-1.5 text- rounded bg-zinc-900 text-white dark:bg-white dark:text-black"
          >
            {max}
          </button>
        )}
      </div>
    </div>
  );
}
