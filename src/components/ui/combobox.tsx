"use client";
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";

type Option = { value: string; label: string };

interface ComboboxProps {
  options: Option[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "—",
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  // Manejo de foco manual al abrir el menú (reemplaza autoFocus)
  useEffect(() => {
    if (open) {
      // Un pequeño delay asegura que el portal ya esté montado en el DOM
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Cálculo de posición movido dentro del hook para satisfacer exhaustive-deps
  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 260; // estimado max-h-65
      const spaceBelow = window.innerHeight - rect.bottom - 16; // 16px margen + barra fija
      const spaceAbove = rect.top - 16;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setPlacement("top");
        setCoords({
          left: rect.left,
          top: rect.top,
          width: rect.width,
        });
      } else {
        setPlacement("bottom");
        setCoords({
          left: rect.left,
          top: rect.bottom,
          width: rect.width,
        });
      }
    };

    updatePosition();
    // Re-calcular en resize/scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        const dropdown = document.getElementById("combobox-portal-dropdown");
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((o) => !o);
            if (!open) setQuery("");
          }
        }}
        className="flex h-8 w-full items-center justify-between rounded-lg border border-[#E8E0D6] bg-[#FFFEFB] px-2.5 text-[12px] font-medium text-[#1A1A1A] shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition-colors hover:border-[#D9CFC2] disabled:opacity-50"
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-[#9A9590] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {mounted &&
        open &&
        coords &&
        createPortal(
          <div
            id="combobox-portal-dropdown"
            className="fixed z-9999 overflow-hidden rounded-lg border border-[#EDE8E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95"
            style={{
              left: coords.left,
              width: coords.width,
              ...(placement === "bottom"
                ? { top: coords.top + 4 }
                : { bottom: window.innerHeight - coords.top + 4 }),
            }}
          >
            <div className="flex items-center gap-2 border-b border-[#F0EDE6] px-2.5 py-2">
              <Search className="size-3.5 text-[#9A9590] shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent text-[12px] outline-none placeholder:text-[#9A9590]"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="px-2.5 py-2 text-[12px] text-[#9A9590]">
                  Sin resultados
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] transition-colors hover:bg-[#F8F5F0] ${value === opt.value ? "bg-[#F8F5F0] font-semibold text-[#111]" : "text-[#1A1A1A]"}`}
                  >
                    <Check
                      className={`size-3.5 shrink-0 ${value === opt.value ? "opacity-100" : "opacity-0"}`}
                    />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
