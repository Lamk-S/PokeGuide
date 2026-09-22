"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import {
  filterCompetitiveItems,
  type CompetitiveItem,
} from "../constants/competitiveItems";

interface ItemSelectProps {
  itemList: CompetitiveItem[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
}

export function ItemSelect({
  itemList,
  value,
  onValueChange,
  placeholder = "Opcional... ej. Vidasfera",
}: ItemSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const competitiveList = useMemo(
    () => filterCompetitiveItems(itemList),
    [itemList],
  );
  const sourceList = showAll ? itemList : competitiveList;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sourceList.slice(0, 60);
    return sourceList
      .filter((i) => {
        const name = (i.nameEs || i.name).toLowerCase();
        const orig = i.name.toLowerCase();
        return name.includes(q) || orig.includes(q);
      })
      .slice(0, 60);
  }, [sourceList, query]);

  const selected = useMemo(
    () => itemList.find((i) => i.name === value),
    [itemList, value],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 rounded-lg border border-[#D9E0E8] bg-white text-sm flex items-center justify-between gap-2 hover:border-[#B9C4D1] focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32] text-left"
      >
        {selected ? (
          <span className="flex items-center gap-2 min-w-0">
            <span className="size-6 rounded-md bg-[#F0F3F7] border border-[#E6EBF1] flex items-center justify-center text-[11px] shrink-0">
              {selected.sprite ? (
                <Image
                  src={selected.sprite}
                  alt={selected.name}
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                  unoptimized
                />
              ) : (
                "🎒"
              )}
            </span>
            <span className="font-medium truncate">
              {selected.nameEs || selected.name}
            </span>
          </span>
        ) : (
          <span className="text-[#7B8794] truncate">{placeholder}</span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          className="text-[#7B8794] shrink-0"
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

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#D9E0E8] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0F3F7] space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca objeto competitivo..."
              className="w-full h-8 px-2.5 rounded-md border border-[#D9E0E8] bg-[#F5F7FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#5F6B7A]">
                {showAll
                  ? `${itemList.length} objetos`
                  : `${competitiveList.length} competitivos`}
              </span>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-[11px] px-2 py-1 rounded-md border border-[#D9E0E8] hover:bg-[#F5F7FA] text-[#182033] font-medium"
              >
                {showAll ? "Solo competitivos" : "Ver todos"}
              </button>
            </div>
          </div>
          <div className="overflow-auto py-1">
            <button
              type="button"
              onClick={() => {
                onValueChange("");
                setOpen(false);
                setQuery("");
              }}
              className="w-full px-3 py-2 text-left text-sm text-[#7B8794] hover:bg-[#F5F7FA] hover:text-[#182033]"
            >
              Sin objeto
            </button>
            {filtered.map((item) => {
              const isSelected = item.name === value;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onValueChange(item.name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2.5 flex items-start gap-2.5 text-left hover:bg-[#F5F7FA] ${isSelected ? "bg-[#F0F3F7]" : ""}`}
                >
                  <span className="size-7 rounded-md bg-[#F0F3F7] border border-[#E6EBF1] flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                    {item.sprite ? (
                      <Image
                        src={item.sprite}
                        alt={item.name}
                        width={20}
                        height={20}
                        className="size-5 object-contain"
                        unoptimized
                      />
                    ) : (
                      "🎒"
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`text-[13px] font-medium block truncate ${isSelected ? "text-[#182033]" : "text-[#182033]"}`}
                    >
                      {item.nameEs || item.name}
                    </span>
                    <span className="text-[11px] text-[#7B8794] line-clamp-2 leading-[1.3] mt-0.5">
                      {item.effectEs || item.effect || "Objeto competitivo"}
                    </span>
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-3 text-center text-sm text-[#7B8794]">
                No se encontró
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
