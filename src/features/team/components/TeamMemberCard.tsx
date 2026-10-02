"use client";

import type { TeamMember } from "@/domain/team/types/TeamTypes";
import { TypeEffectiveness, ALL_POKEMON_TYPES } from "@/domain/types/TypeChart";
import type { PokemonType } from "@/domain/pokemon/types/pokemon";
import { PokemonSprite } from "@/components/ui/PokemonSprite";

type MemberWithMeta = TeamMember & {
  readonly id?: string;
  readonly name?: string;
  readonly species?: string;
};

interface Props {
  readonly member: TeamMember;
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onReplace: (index: number) => void;
}

const TYPE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  normal: { bg: "bg-[#F3F0E8]", text: "text-[#8B8680]", dot: "bg-[#8B8680]" },
  fire: { bg: "bg-[#FFEBE0]", text: "text-[#B45309]", dot: "bg-[#F97316]" },
  water: { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", dot: "bg-[#3B82F6]" },
  electric: { bg: "bg-[#FEF9C3]", text: "text-[#854D0E]", dot: "bg-[#EAB308]" },
  grass: { bg: "bg-[#DCFCE7]", text: "text-[#166534]", dot: "bg-[#22C55E]" },
  ice: { bg: "bg-[#E0F2FE]", text: "text-[#0E7490]", dot: "bg-[#06B6D4]" },
  fighting: { bg: "bg-[#FECACA]", text: "text-[#991B1B]", dot: "bg-[#EF4444]" },
  poison: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]", dot: "bg-[#A855F7]" },
  ground: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "bg-[#D97706]" },
  flying: { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]", dot: "bg-[#6366F1]" },
  psychic: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]", dot: "bg-[#EC4899]" },
  bug: { bg: "bg-[#ECFCCB]", text: "text-[#3F6212]", dot: "bg-[#84CC16]" },
  rock: { bg: "bg-[#E7E5D4]", text: "text-[#57534E]", dot: "bg-[#A8A29E]" },
  ghost: { bg: "bg-[#EDE9FE]", text: "text-[#5B21B6]", dot: "bg-[#8B5CF6]" },
  dragon: { bg: "bg-[#DDD6FE]", text: "text-[#5B21B6]", dot: "bg-[#7C3AED]" },
  dark: { bg: "bg-[#E7E5E4]", text: "text-[#44403C]", dot: "bg-[#57534E]" },
  steel: { bg: "bg-[#E5E7EB]", text: "text-[#52525B]", dot: "bg-[#71717A]" },
  fairy: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]", dot: "bg-[#F472B6]" },
};

const NAME_TO_ID: Record<string, number> = {
  aerodactyl: 142,
  luxray: 405,
  venusaur: 3,
  gyarados: 130,
  dragonite: 149,
  gengar: 94,
  clefable: 36,
  corviknight: 823,
  garchomp: 445,
  ferrothorn: 598,
  dragapult: 887,
  heatran: 485,
  toxapex: 748,
  weavile: 461,
  "rotom-wash": 479,
  rotom: 479,
  tyranitar: 248,
  gholdengo: 1000,
  landorus: 645,
};

function getDisplayName(member: TeamMember): string {
  const meta = member as unknown as MemberWithMeta;
  return meta.name ?? meta.species ?? meta.id ?? "Desconocido";
}

function getNumericId(member: TeamMember): number {
  const meta = member as unknown as MemberWithMeta;
  const idStr = meta.id ?? "";
  const num = Number.parseInt(idStr, 10);
  if (!Number.isNaN(num) && num > 0 && num < 10000) return num;
  const nameKey = (meta.name ?? meta.species ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  if (NAME_TO_ID[nameKey]) return NAME_TO_ID[nameKey];
  const clean = nameKey.replace(/[^a-z0-9-]/g, "");
  if (NAME_TO_ID[clean]) return NAME_TO_ID[clean];
  return 25;
}

function getStats(member: TeamMember) {
  const s = member.calculatedStats as unknown as Record<string, number>;
  return {
    hp: s?.hp ?? 0,
    atk: s?.attack ?? 0,
    def: s?.defense ?? 0,
    spa: s?.specialAttack ?? s?.spAttack ?? 0,
    spd: s?.specialDefense ?? s?.spDefense ?? 0,
    vel: s?.speed ?? 0,
  };
}

export function TeamMemberCard({ member, index, onRemove, onReplace }: Props) {
  const displayName = getDisplayName(member);
  const numericId = getNumericId(member);
  const stats = getStats(member);
  const primaryType = (member.types?.[0]?.toLowerCase() ?? "normal") as string;
  const primaryStyle = TYPE_STYLE[primaryType] ?? TYPE_STYLE.normal;

  const statEntries = [
    { label: "PS", value: stats.hp },
    { label: "ATQ", value: stats.atk },
    { label: "DEF", value: stats.def },
    { label: "ATE", value: stats.spa },
    { label: "DFE", value: stats.spd },
    { label: "VEL", value: stats.vel },
  ];

  const maxStat = Math.max(...statEntries.map((e) => e.value));

  const resistCount = ALL_POKEMON_TYPES.reduce((acc, atk) => {
    const mult = TypeEffectiveness.getMultiplier(
      atk as PokemonType,
      member.types,
    );
    return mult < 1 || mult === 0 ? acc + 1 : acc;
  }, 0);
  const coveragePct = Math.round(
    (resistCount / ALL_POKEMON_TYPES.length) * 100,
  );

  return (
    <div className="group flex flex-col rounded-[20px] border border-[#EDE8E0] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex gap-3">
        <div
          className={`flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border ${primaryStyle.bg} border-[#F0EDE6]`}
        >
          <PokemonSprite
            pokemon={{ id: numericId, name: displayName.toLowerCase() }}
            size={56}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-serif text-[15px] font-semibold tracking-[-0.01em] text-zinc-900">
              {displayName}
            </h3>
            <button
              type="button"
              onClick={() => onReplace(index)}
              className="shrink-0 rounded-full border border-transparent bg-[#F8F5F0] px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
            >
              Cambiar
            </button>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {member.types.map((t) => {
              const st = TYPE_STYLE[t.toLowerCase()] ?? TYPE_STYLE.normal;
              return (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${st.bg} ${st.text}`}
                >
                  <span className={`size-1 rounded-full ${st.dot}`} />
                  {t}
                </span>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-zinc-500">
              #{String(numericId).padStart(3, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-400">
              NV. 50 • SINGLES
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-0.5 rounded-[12px] bg-[#F8F5F0] p-1">
        {statEntries.map((s) => {
          const isMax = s.value === maxStat && s.value > 0;
          return (
            <div
              key={s.label}
              className={`flex flex-col items-center rounded-[8px] py-1 ${isMax ? "bg-zinc-900 text-white" : "text-zinc-700"}`}
            >
              <span
                className={`text-[9px] font-medium uppercase tracking-widest ${isMax ? "text-zinc-300" : "text-zinc-400"}`}
              >
                {s.label}
              </span>
              <span className="mt-0.5 text-[12px] font-semibold tabular-nums">
                {s.value || "-"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-zinc-900"
              style={{ width: `${coveragePct}%` }}
            />
          </div>
          <span className="text-[11px] text-zinc-500">
            Cobertura {coveragePct}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Quitar
        </button>
      </div>
    </div>
  );
}
