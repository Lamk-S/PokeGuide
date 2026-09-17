"use client";
import { useState, useEffect } from "react";
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
  const [localValue, setLocalValue] = useState<string>(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const clamp = (v: number) => Math.max(min, Math.min(max, Math.floor(v)));

  const handleBlur = () => {
    const parsed = clamp(Number(localValue) || 0);
    setLocalValue(parsed.toString());
    onChange(parsed);
  };

  return (
    <div className="flex items-center gap-2 w-full py-1">
      <Label className="w-20 text-xs truncate">{label}</Label>
      <span className="w-7 text-xs font-mono text-zinc-500">{abbr}</span>

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
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        className="w-14 h-7 text-xs px-1 text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none m-0"
      />

      <div className="flex w-14 gap-1 shrink-0">
        {onSetMin && (
          <button
            type="button"
            onClick={onSetMin}
            className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 text-[10px] font-bold text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            0
          </button>
        )}

        {onSetMax && (
          <button
            type="button"
            onClick={onSetMax}
            className="flex h-7 w-7 items-center justify-center rounded bg-zinc-900 text-[10px] font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {max}
          </button>
        )}
      </div>
    </div>
  );
}
