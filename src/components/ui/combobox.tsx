"use client";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string | undefined;
  disabled?: boolean | undefined;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  disabled,
  id,
  ...ariaProps
}: ComboboxProps) {
  const autoId = React.useId();
  const comboboxId = id || autoId;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const filtered = React.useMemo(() => {
    if (!query) return options.slice(0, 100);
    const lowerQuery = query.toLowerCase();
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(lowerQuery) ||
          o.description?.toLowerCase().includes(lowerQuery),
      )
      .slice(0, 100);
  }, [options, query]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ELIMINADO: Se borró el useEffect problemático.
  // Ahora manejamos el reseteo de índice reactivamente en el evento onChange.

  const selected = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + filtered.length) % filtered.length,
        );
        break;
      case "Enter": {
        // SOLUCIÓN: Agregadas las llaves { } para encapsular el scope de const activeOpt.
        e.preventDefault();
        const activeOpt = filtered[activeIndex];
        if (activeOpt && !activeOpt.disabled) {
          onValueChange(activeOpt.value);
          setOpen(false);
          triggerRef.current?.focus();
        }
        break;
      }
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  return (
    // SOLUCIÓN: Directiva explícita para Biome explicando la arquitectura del evento.
    // biome-ignore lint/a11y/noStaticElementInteractions: Delegación intencional de eventos de teclado (bubbling) desde el Input y Button internos.
    <div
      className="relative w-full"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <Button
        ref={triggerRef}
        type="button"
        id={comboboxId}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? `${comboboxId}-listbox` : undefined}
        disabled={disabled ?? false}
        className={cn(
          "w-full justify-between font-normal",
          !selected && "text-zinc-500 dark:text-zinc-400",
        )}
        onClick={() => setOpen(!open)}
        {...ariaProps}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg animate-in fade-in-80 zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // SOLUCIÓN: Reseteamos el índice de foco aquí al tipear, puramente Event-Driven.
                setActiveIndex(0);
              }}
              role="combobox"
              aria-expanded={true}
              aria-controls={`${comboboxId}-listbox`}
              aria-autocomplete="list"
              aria-activedescendant={
                filtered[activeIndex]
                  ? `${comboboxId}-option-${filtered[activeIndex].value}`
                  : undefined
              }
            />
            <CommandList id={`${comboboxId}-listbox`} role="listbox">
              {filtered.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filtered.map((opt, index) => {
                    const isSelected = value === opt.value;
                    const isActive = index === activeIndex;
                    return (
                      <CommandItem
                        key={opt.value}
                        id={`${comboboxId}-option-${opt.value}`}
                        role="option"
                        aria-selected={isSelected}
                        data-selected={isActive}
                        disabled={opt.disabled ?? false}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          if (!opt.disabled) {
                            onValueChange(opt.value);
                            setOpen(false);
                            triggerRef.current?.focus();
                          }
                        }}
                        className={cn(
                          opt.disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate font-medium">
                            {opt.label}
                          </span>
                          {opt.description && (
                            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {opt.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
