"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";

interface MoveOption {
  value: string;
  label: string;
  type: string;
  power?: number | null;
  accuracy?: number | null;
  description?: string;
}

interface MoveSelectProps {
  options: MoveOption[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  defenderTypes?: string[] | undefined;
  attackerTypes?: string[] | undefined;
  disabled?: boolean;
}

export function MoveSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona movimiento...",
  defenderTypes,
  attackerTypes,
  disabled,
}: MoveSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !disabled) {
      inputRef.current?.focus();
    }
  }, [open, disabled]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = options;
    if (q) {
      list = options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q),
      );
    }
    if (defenderTypes && defenderTypes.length > 0) {
      return [...list].sort((a, b) => {
        const effA = TypeEffectiveness.getMultiplier(
          a.type as PokemonType,
          defenderTypes as PokemonType[],
        );
        const effB = TypeEffectiveness.getMultiplier(
          b.type as PokemonType,
          defenderTypes as PokemonType[],
        );
        const stabA = attackerTypes?.some(
          (t) => t.toLowerCase() === a.type.toLowerCase(),
        )
          ? 1.5
          : 1;
        const stabB = attackerTypes?.some(
          (t) => t.toLowerCase() === b.type.toLowerCase(),
        )
          ? 1.5
          : 1;
        const scoreA = (a.power || 0) * effA * stabA;
        const scoreB = (b.power || 0) * effB * stabB;
        return scoreB - scoreA;
      });
    }
    return [...list].sort((a, b) => (b.power || 0) - (a.power || 0));
  }, [options, query, defenderTypes, attackerTypes]);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const getPowerColor = (power?: number | null) => {
    if (!power) return "text-[#7B8794]";
    if (power >= 100) return "text-[#C7373F] font-semibold";
    if (power >= 80) return "text-[#182033] font-medium";
    return "text-[#5F6B7A]";
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full h-10 px-3 rounded-lg border bg-white text-sm flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32] text-left ${disabled ? "border-[#E6EBF1] bg-[#F5F7FA] cursor-not-allowed" : "border-[#D9E0E8] hover:border-[#B9C4D1]"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-medium truncate">{selected.label}</span>
            <span className="flex items-center gap-1.5 ml-auto shrink-0">
              <TypeBadge type={selected.type} size="sm" />
              {selected.power ? (
                <span
                  className={`text-[11px] tabular-nums ${getPowerColor(selected.power)}`}
                >
                  {selected.power}
                </span>
              ) : (
                <span className="text-[11px] text-[#7B8794]">—</span>
              )}
            </span>
          </span>
        ) : (
          <span className="text-[#7B8794] truncate">{placeholder}</span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          className="text-[#7B8794] shrink-0 ml-1"
          aria-hidden="true"
        >
          <title>Chevron</title>
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#D9E0E8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0F3F7]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca movimiento o tipo..."
              className="w-full h-8 px-2.5 rounded-md border border-[#D9E0E8] bg-[#F5F7FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
            />
            {defenderTypes && defenderTypes.length > 0 && (
              <div className="mt-2 text-[11px] text-[#5F6B7A] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-[#16845B]" />
                Ordenado por daño vs defensor
              </div>
            )}
          </div>
          <div className="overflow-auto py-1">
            {filtered.map((opt) => {
              const isSelected = opt.value === value;
              const eff = defenderTypes
                ? TypeEffectiveness.getMultiplier(
                    opt.type as PokemonType,
                    defenderTypes as PokemonType[],
                  )
                : 1;
              const effLabel =
                eff === 0
                  ? "Nulo"
                  : eff >= 2
                    ? "Super"
                    : eff <= 0.5
                      ? "Resist"
                      : "";
              const effColor =
                eff === 0
                  ? "bg-[#F0F3F7] text-[#7B8794]"
                  : eff >= 2
                    ? "bg-[#ECFDF5] text-[#065F46]"
                    : eff <= 0.5
                      ? "bg-[#FFF7ED] text-[#9A3412]"
                      : "hidden";

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2.5 flex items-center gap-2 text-left hover:bg-[#F5F7FA] ${isSelected ? "bg-[#F0F3F7]" : ""}`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[13px] font-medium truncate ${isSelected ? "text-[#182033]" : "text-[#182033]"}`}
                      >
                        {opt.label}
                      </span>
                      {effLabel && (
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-semibold uppercase tracking-wide ${effColor}`}
                        >
                          {effLabel}
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-[#7B8794] flex items-center gap-2 mt-0.5">
                      {opt.accuracy ? (
                        <span>{opt.accuracy}% prec.</span>
                      ) : (
                        <span>— prec.</span>
                      )}
                      {eff !== 1 && (
                        <span className="text-[#5F6B7A]">
                          · x{eff} vs defensor
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <TypeBadge type={opt.type} size="sm" />
                    <span
                      className={`text-[11px] tabular-nums ${getPowerColor(opt.power)}`}
                    >
                      {opt.power ? `${opt.power} pot.` : "Estado"}
                    </span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-sm text-[#7B8794]">
                No se encontró movimiento
              </div>
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
