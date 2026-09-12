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
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecciona...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-950">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filtered.slice(0, 100).map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
