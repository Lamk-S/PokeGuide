"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TypeBadge, translateTypeUpper } from "@/components/ui/TypeBadge";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { TypeEffectiveness } from "@/domain/types/TypeChart";

interface MoveOption {
  value: string;
  label: string;
  type: string;
  power?: number | null;
  accuracy?: number | null;
  description?: string;
}
interface Props {
  options: MoveOption[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string | undefined;
  defenderTypes?: string[] | undefined;
  attackerTypes?: string[] | undefined;
  disabled?: boolean | undefined;
}
export function MoveSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona movimiento...",
  defenderTypes,
  attackerTypes,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open && !disabled) inputRef.current?.focus();
  }, [open, disabled]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = options;
    if (q)
      list = options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q),
      );
    if (defenderTypes?.length) {
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
        return (b.power || 0) * effB * stabB - (a.power || 0) * effA * stabA;
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
        className={`w-full h-8 px-2.5 rounded-md border bg-white text-[13px] flex items-center justify-between gap-2 text-left ${disabled ? "bg-[#F8F5F0] text-[#9A9590]" : "border-[#E8E0D6]"}`}
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-medium truncate">{selected.label}</span>
            <span className="hidden sm:flex text-[10px] font-mono text-[#9A9590] ml-auto">
              {translateTypeUpper(selected.type)} •{" "}
              {selected.power ? `${selected.power} pot.` : "Estado"}
            </span>
          </span>
        ) : (
          <span className="text-[#9A9590] text-[12px]">{placeholder}</span>
        )}
        <ChevronDown className="size-3.5 text-[#9A9590] shrink-0" />
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-[#FFFEFB] shadow max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca movimiento..."
              className="w-full h-8 px-2.5 rounded-md border bg-[#F8F5F0] text-[13px]"
            />
          </div>
          <div className="overflow-auto py-1">
            {filtered.map((opt) => {
              const eff = defenderTypes
                ? TypeEffectiveness.getMultiplier(
                    opt.type as PokemonType,
                    defenderTypes as PokemonType[],
                  )
                : 1;
              const isSelected = opt.value === value;
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
                    <span className="text-[13px] font-medium">{opt.label}</span>
                    <span className="text-[10px] font-mono text-[#9A9590] block">
                      {opt.power ? `${opt.power} pot.` : "Estado"} •{" "}
                      {translateTypeUpper(opt.type)}{" "}
                      {eff !== 1 ? `• x${eff}` : ""}
                    </span>
                  </span>
                  <TypeBadge type={opt.type} size="sm" />
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
