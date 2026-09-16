"use client";
import * as React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface StatSliderRowProps {
  label: string;
  abbr?: string;
  value: number;
  min: number;
  max: number;
  totalLimitMax?: number;
  onChange: (val: number) => void;
  onSetMin?: () => void;
  onSetMax?: () => void;
}

export const StatSliderRow = React.memo(function StatSliderRow({
  label,
  abbr,
  value,
  min,
  max,
  totalLimitMax,
  onChange,
  onSetMin,
  onSetMax,
}: StatSliderRowProps) {
  const inputId = React.useId();
  const [localValue, setLocalValue] = React.useState<string>(value.toString());

  React.useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    const parsed = parseInt(localValue, 10);
    if (Number.isNaN(parsed)) {
      setLocalValue(value.toString());
    } else {
      onChange(parsed);
      setLocalValue(parsed.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const currentMaxAllowed =
    totalLimitMax !== undefined ? Math.min(max, totalLimitMax) : max;

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-20 shrink-0 flex flex-col">
        <Label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </Label>
        {abbr && <span className="text-[10px] text-zinc-500">{abbr}</span>}
      </div>

      <div className="flex flex-1 items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-800 dark:bg-zinc-800 dark:accent-zinc-300"
          disabled={
            currentMaxAllowed <= value &&
            value !== max &&
            totalLimitMax !== undefined
          }
        />
        <input
          id={inputId}
          type="number"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-14 rounded border border-zinc-300 bg-white px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          aria-label={`Valor de ${label}`}
        />
      </div>

      <div className="flex w-16 shrink-0 justify-end gap-1">
        {onSetMin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-[10px]"
            onClick={onSetMin}
            aria-label={`Poner ${label} al mínimo`}
          >
            0
          </Button>
        )}
        {onSetMax && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-8 p-0 text-[10px]"
            onClick={onSetMax}
            aria-label={`Poner ${label} al máximo`}
          >
            {max}
          </Button>
        )}
      </div>
    </div>
  );
});
