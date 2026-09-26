"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
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
  placeholder = "—",
}: ItemSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
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
        className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-white text-[13px] flex items-center justify-between gap-2 hover:border-[#D9CFC2] focus:outline-none focus:ring-1 focus:ring-[#111]/20 text-left"
      >
        {selected ? (
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="size-5 rounded bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center shrink-0">
              {selected.sprite ? (
                <Image
                  src={selected.sprite}
                  alt={selected.name}
                  width={16}
                  height={16}
                  className="size-4 object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-[10px]">🎒</span>
              )}
            </span>
            <span className="font-medium truncate text-[12px]">
              {selected.nameEs || selected.name}
            </span>
          </span>
        ) : (
          <span className="text-[#9A9590] truncate text-[12px]">
            {placeholder}
          </span>
        )}
        <ChevronDown className="size-3.5 text-[#9A9590] shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E8E0D6] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-80 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#F0EDE6] space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca objeto..."
              className="w-full h-8 px-2.5 rounded-md border border-[#E8E0D6] bg-[#F8F5F0] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#111]/20"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#9A9590]">
                {showAll
                  ? `${itemList.length} objetos`
                  : `${competitiveList.length} competitivos`}
              </span>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="text-[10px] px-2 py-1 rounded-md border border-[#E8E0D6] hover:bg-[#F8F5F0] font-medium"
              >
                {showAll ? "Solo comp." : "Ver todos"}
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
              className="w-full px-3 py-2 text-left text-[12px] text-[#9A9590] hover:bg-[#F8F5F0]"
            >
              Sin objeto
            </button>
            {filtered.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onValueChange(item.name);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full px-3 py-2 flex items-start gap-2 text-left hover:bg-[#F8F5F0] ${item.name === value ? "bg-[#F0EDE6]" : ""}`}
              >
                <span className="size-6 rounded bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center shrink-0 mt-0.5">
                  {item.sprite ? (
                    <Image
                      src={item.sprite}
                      alt={item.name}
                      width={16}
                      height={16}
                      className="size-4 object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[10px]">🎒</span>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="text-[12px] font-medium block truncate">
                    {item.nameEs || item.name}
                  </span>
                  <span className="text-[10px] text-[#9A9590] line-clamp-2 leading-[1.3]">
                    {item.effectEs || item.effect || ""}
                  </span>
                </span>
              </button>
            ))}
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
