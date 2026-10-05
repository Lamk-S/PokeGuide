"use client";

import { useState } from "react";
import { useTeamStore } from "../store/useTeamStore";
import { TeamMemberCard } from "./TeamMemberCard";
import { PokemonSelector } from "./PokemonSelector";
import type { TeamMember } from "@/domain/team/types/TeamTypes";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
};

function getMemberStableId(member: TeamMember, slotIndex: number): string {
  const meta = member as unknown as MemberWithMeta;
  const baseId = meta.id ?? meta.name ?? "member";
  return `slot-${slotIndex}-${baseId}`;
}

const POSICIONES_SUGERIDAS = [
  { label: "Posición 1", sugerencia: "Apertura", nota: "Lead" },
  { label: "Posición 2", sugerencia: "Muro físico", nota: "Defensa" },
  { label: "Posición 3", sugerencia: "Ofensivo", nota: "Sweeper" },
  { label: "Posición 4", sugerencia: "Pivote", nota: "Momentum" },
  { label: "Posición 5", sugerencia: "Muro especial", nota: "Resistencia" },
  { label: "Posición 6", sugerencia: "Cierre", nota: "Rematador" },
] as const;

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <section
      className="border border-[#EDE8E0] bg-white"
      aria-labelledby="empty-title"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="inline-flex border border-[#EDE8E0] px-2 py-1 text-[10px] uppercase tracking-widest text-zinc-500">
            Atlas vacío
          </div>
          <h2
            id="empty-title"
            className="mt-4 max-w-[18ch] font-serif text-[24px] font-semibold leading-[0.95] tracking-[-0.02em] text-[#111] sm:text-[28px]"
          >
            Tu equipo empieza en blanco.
          </h2>
          <p className="mt-3 max-w-[42ch] text-[13px] leading-normal text-zinc-600">
            Añade Pokémon para activar cobertura, velocidad y dependencias
            defensivas.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 bg-[#111] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
            >
              + Añadir primer Pokémon
            </button>
          </div>
        </div>
        <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] p-4 sm:p-6 lg:border-l lg:border-t-0">
          <div className="grid grid-cols-2 gap-2">
            {POSICIONES_SUGERIDAS.map((pos, i) => (
              <button
                key={pos.label}
                type="button"
                onClick={onAdd}
                className="border border-dashed border-[#D9D2C7] bg-white px-3 py-3 text-left hover:border-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tabular-nums text-zinc-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-zinc-500">
                    {pos.label}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-medium text-[#111]">
                  {pos.sugerencia}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamBuilderGrid() {
  const team = useTeamStore((s) => s.team);
  const addMember = useTeamStore((s) => s.addMember);
  const removeMember = useTeamStore((s) => s.removeMember);
  const replaceMember = useTeamStore((s) => s.replaceMember);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const members = team.getMembers();
  const slots = Array.from({ length: 6 }, (_, i) => members[i] ?? null);
  const isEmpty = members.length === 0;

  const handleSelect = (member: TeamMember) => {
    if (replacingIndex !== null) {
      replaceMember(replacingIndex, member);
      setReplacingIndex(null);
    } else {
      addMember(member);
    }
  };

  const openReplace = (index: number) => {
    setReplacingIndex(index);
    setSelectorOpen(true);
  };

  const openAdd = () => {
    setReplacingIndex(null);
    setSelectorOpen(true);
  };

  return (
    <>
      {isEmpty ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <section aria-labelledby="equipo-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              id="equipo-title"
              className="font-serif text-[16px] font-semibold tracking-[-0.02em] text-[#111]"
            >
              Equipo{" "}
              <span className="font-normal text-zinc-400">
                · {members.length}/6
              </span>
            </h2>
            <span className="hidden text-[10px] text-zinc-500 sm:block">
              Orden = prioridad de lectura
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((member, idx) => {
              const slotKey = member
                ? getMemberStableId(member, idx)
                : `empty-slot-${idx}`;
              const pos = POSICIONES_SUGERIDAS[idx];
              return member ? (
                <div
                  key={slotKey}
                  className="flex w-full border border-[#EDE8E0] bg-white"
                >
                  <TeamMemberCard
                    member={member}
                    index={idx}
                    onRemove={removeMember}
                    onReplace={openReplace}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  key={slotKey}
                  onClick={openAdd}
                  className="group flex min-h-45 flex-col items-center justify-center gap-2 border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-4 text-center hover:border-[#111] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                  aria-label={`Añadir en ${pos.label}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center border border-[#EDE8E0] bg-white text-[14px] text-zinc-400 group-hover:border-[#111] group-hover:text-[#111]">
                    +
                  </span>
                  <span className="text-[11px] font-medium text-[#111]">
                    {pos.sugerencia}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {String(idx + 1).padStart(2, "0")} · {pos.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <PokemonSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelect}
        replacingIndex={replacingIndex}
      />
    </>
  );
}
