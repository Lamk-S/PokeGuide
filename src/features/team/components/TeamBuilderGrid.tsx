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

export function TeamBuilderGrid() {
  const team = useTeamStore((s) => s.team);
  const addMember = useTeamStore((s) => s.addMember);
  const removeMember = useTeamStore((s) => s.removeMember);
  const replaceMember = useTeamStore((s) => s.replaceMember);
  const clearTeam = useTeamStore((s) => s.clearTeam);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  const members = team.getMembers();
  const slots = Array.from({ length: 6 }, (_, i) => members[i] ?? null);

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
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-[22px] font-semibold tracking-[-0.02em] text-zinc-900">
            Team Builder
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-600">
            {members.length}/6
          </span>
        </div>
        {members.length > 0 && (
          <button
            type="button"
            onClick={clearTeam}
            className="text-[12px] font-medium text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((member, idx) => {
          const slotKey = member
            ? getMemberStableId(member, idx)
            : `empty-slot-${idx}`;
          return member ? (
            <TeamMemberCard
              key={slotKey}
              member={member}
              index={idx}
              onRemove={removeMember}
              onReplace={openReplace}
            />
          ) : (
            <button
              type="button"
              key={slotKey}
              onClick={openAdd}
              className="group flex min-h-32 flex-col items-center justify-center rounded-[12px] border border-dashed border-zinc-300 bg-zinc-50/50 p-4 transition-all hover:border-zinc-900 hover:bg-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 group-hover:border-zinc-900 group-hover:text-zinc-900">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <title>Añadir</title>
                  <path
                    d="M8 3.5V12.5M3.5 8H12.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
              <span className="mt-2 text-[12px] font-medium text-zinc-500 group-hover:text-zinc-900">
                Slot {idx + 1} vacío
              </span>
              <span className="text-[11px] text-zinc-400">Añadir Pokémon</span>
            </button>
          );
        })}
      </div>

      <PokemonSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelect}
        replacingIndex={replacingIndex}
      />
    </>
  );
}
