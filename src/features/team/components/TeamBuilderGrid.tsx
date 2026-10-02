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

const SLOT_ROLES = [
  { role: "Apertura", desc: "Lead / Hazard", icon: "◐" },
  { role: "Muro Físico", desc: "Defensa", icon: "⬢" },
  { role: "Sweeper", desc: "Ofensivo", icon: "⚡" },
  { role: "Pivot", desc: "Momentum", icon: "↻" },
  { role: "Muro Esp.", desc: "Especial", icon: "⬣" },
  { role: "Closer", desc: "Rematador", icon: "✦" },
];

function EmptyHero({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#EDE8E0] bg-[#FFFEFB]">
      <div className="absolute inset-0 bg-[radial-gradient(600px_at_15%_10%,rgba(217,59,50,0.10),transparent),radial-gradient(800px_at_85%_80%,rgba(217,59,50,0.06),transparent)]" />
      <div className="absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-[#EDE8E0] to-transparent hidden lg:block" />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-0">
        <div className="p-8 lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#F3D2D0] bg-[#FFF1F0] px-3 py-1 text-[10px] font-bold tracking-widest text-[#B91C1C]">
            <span className="size-1.5 rounded-full bg-[#D93B32] animate-pulse" />
            CONSTRUCTOR • LOCAL-FIRST
          </div>

          <h2 className="mt-5 font-serif text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111] lg:text-[32px]">
            Tu equipo
            <br />
            <span className="text-[#8A8A8A]">empieza en blanco.</span>
            <br />
            <span className="bg-linear-to-r from-[#D93B32] to-[#111] bg-clip-text text-transparent">
              Hazlo imparable.
            </span>
          </h2>

          <p className="mt-4 max-w-96 text-[13px] leading-relaxed text-[#6B6560]">
            Herramienta determinista y explicable.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-[12px] border border-[#EDE8E0] bg-white p-3">
              <div className="text-[11px] font-bold tracking-widest text-[#111]">
                100% LOCAL
              </div>
              <div className="mt-1 text-[11px] leading-tight text-[#8A8A8A]">
                Sin envío de datos. Tu equipo nunca sale del navegador.
              </div>
            </div>
            <div className="rounded-[12px] border border-[#EDE8E0] bg-white p-3">
              <div className="text-[11px] font-bold tracking-widest text-[#111]">
                EXPLICABLE
              </div>
              <div className="mt-1 text-[11px] leading-tight text-[#8A8A8A]">
                Cada riesgo con razón, impacto y acción sugerida.
              </div>
            </div>
            <div className="rounded-[12px] border border-[#EDE8E0] bg-white p-3">
              <div className="text-[11px] font-bold tracking-widest text-[#111]">
                ÓPTIMO
              </div>
              <div className="mt-1 text-[11px] leading-tight text-[#8A8A8A]">
                Virtualizado 60fps, 1351 especies, carga instantánea.
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:-translate-y-px"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-white text-[12px] text-black">
                +
              </span>
              Añadir primer Pokémon
            </button>
            <span className="text-[11px] text-[#9A9590]">
              o presiona un slot vacío →
            </span>
          </div>
        </div>

        <div className="relative border-t border-[#EDE8E0] bg-[#F8F5F0]/60 p-6 lg:border-t-0 lg:border-l lg:p-8">
          <div className="grid grid-cols-3 gap-2.5">
            {SLOT_ROLES.map((slot, i) => (
              <button
                key={slot.role}
                type="button"
                onClick={onAdd}
                className="group relative flex flex-col items-start rounded-[16px] border border-dashed border-[#D9D2C7] bg-white/70 p-3 text-left backdrop-blur-sm transition-all hover:border-[#D93B32]/40 hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="flex size-7 items-center justify-center rounded-full border border-[#EDE8E0] bg-white text-[11px] text-[#9A9590] group-hover:border-[#111] group-hover:text-[#111]">
                  {i + 1}
                </div>
                <div className="mt-2.5 text-[11px] font-bold tracking-wide text-[#111]">
                  {slot.role}
                </div>
                <div className="text-[10px] text-[#8A8A8A]">{slot.desc}</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-[#D93B32] opacity-0 transition-opacity group-hover:opacity-100">
                  <span>+</span> Añadir
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[12px] border border-[#EDE8E0] bg-white p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[#9A9590]">
              <span className="size-1 rounded-full bg-emerald-500" /> FLUJO
              RECOMENDADO
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#6B6560]">
              <span className="rounded-full bg-[#111] px-2 py-0.5 text-[10px] text-white">
                1
              </span>{" "}
              Lead
              <span className="text-[#D9D2C7]">→</span>
              <span className="rounded-full bg-[#F8F5F0] px-2 py-0.5 text-[10px]">
                2 muros
              </span>
              <span className="text-[#D9D2C7]">→</span>
              <span className="rounded-full bg-[#F8F5F0] px-2 py-0.5 text-[10px]">
                2 ofensivos
              </span>
              <span className="text-[#D9D2C7]">→</span>
              <span className="rounded-full bg-[#F8F5F0] px-2 py-0.5 text-[10px]">
                1 flex
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        <EmptyHero onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((member, idx) => {
            const slotKey = member
              ? getMemberStableId(member, idx)
              : `empty-slot-${idx}`;
            const role = SLOT_ROLES[idx];
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
                className="group relative flex min-h-38 flex-col items-start justify-between rounded-[20px] border border-dashed border-[#D9D2C7] bg-[#FFFEFB] p-4 text-left transition-all hover:border-[#111] hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex size-8 items-center justify-center rounded-full border border-[#EDE8E0] bg-white text-[11px] font-medium text-[#9A9590] group-hover:border-[#111] group-hover:text-[#111]">
                    {idx + 1}
                  </div>
                  <div className="rounded-full border border-[#EDE8E0] bg-white px-2 py-0.5 text-[10px] tracking-wide text-[#8A8A8A] group-hover:border-[#111] group-hover:text-[#111]">
                    {role.role}
                  </div>
                </div>

                <div className="mt-6 flex w-full flex-col">
                  <div className="flex size-10 items-center justify-center rounded-full border border-[#F0EBE3] bg-[#F8F5F0] text-[#9A9590] transition-colors group-hover:border-[#111] group-hover:bg-[#111] group-hover:text-white">
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
                        strokeWidth="1.3"
                      />
                    </svg>
                  </div>
                  <span className="mt-3 text-[13px] font-semibold tracking-[-0.01em] text-[#111]">
                    Añadir Pokémon
                  </span>
                  <span className="mt-1 text-[11px] leading-tight text-[#8A8A8A]">
                    Slot {idx + 1} • {role.desc} • Vacío
                  </span>
                </div>

                <div className="absolute inset-0 rounded-[20px] bg-linear-to-br from-[#D93B32]/2 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
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
