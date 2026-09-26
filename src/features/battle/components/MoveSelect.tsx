"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { TypeBadge, translateTypeUpper } from "@/components/ui/TypeBadge";
import { TypeEffectiveness } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { ChevronDown } from "lucide-react";

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
    if (open && !disabled) inputRef.current?.focus();
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

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full h-8 px-2.5 rounded-md border bg-white text-[13px] flex items-center justify-between gap-2 text-left transition-colors ${disabled ? "border-[#EDE8E0] bg-[#F8F5F0] cursor-not-allowed text-[#9A9590]" : "border-[#E8E0D6] hover:border-[#D9CFC2] focus:outline-none focus:ring-1 focus:ring-[#111]/20"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-medium truncate">{selected.label}</span>
            <span className="hidden sm:flex items-center gap-1 ml-auto shrink-0">
              <span className="text-[10px] font-mono text-[#9A9590]">
                {translateTypeUpper(selected.type)} •{" "}
                {selected.power ? `${selected.power} pot.` : "Estado"}
              </span>
            </span>
          </span>
        ) : (
          <span className="text-[#9A9590] truncate text-[12px]">
            {placeholder}
          </span>
        )}
        <ChevronDown className="size-3.5 text-[#9A9590] shrink-0" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E8E0D6] bg-[#FFFEFB] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0EDE6]">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca movimiento o tipo..."
              className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-[#F8F5F0] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#111]/20"
            />
            {defenderTypes && defenderTypes.length > 0 && (
              <div className="mt-2 text-[10px] text-[#7A7570] flex items-center gap-1 font-mono">
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
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-[#F8F5F0] ${isSelected ? "bg-[#F0EDE6]" : ""}`}
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-medium truncate">
                        {opt.label}
                      </span>
                      {eff !== 1 && (
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-semibold uppercase ${eff === 0 ? "bg-[#F0F3F7] text-[#7A7570]" : eff >= 2 ? "bg-[#E8F5E9] text-[#2D5A27]" : "bg-[#FFF3E0] text-[#7A3D00]"}`}
                        >
                          {eff === 0 ? "Nulo" : eff >= 2 ? "Súper" : "Resist"}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-[#9A9590] mt-0.5">
                      {opt.power ? `${opt.power} pot.` : "Estado"} •{" "}
                      {translateTypeUpper(opt.type)}{" "}
                      {opt.accuracy ? `• ${opt.accuracy}%` : ""}{" "}
                      {eff !== 1 ? `• x${eff}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0">
                    <TypeBadge type={opt.type} size="sm" />
                  </span>
                </button>
              );
            })}
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
