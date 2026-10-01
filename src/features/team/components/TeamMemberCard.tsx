"use client";

import type { TeamMember } from "@/domain/team/types/TeamTypes";

type MemberWithMeta = TeamMember & {
  readonly name?: string;
  readonly species?: string;
  readonly id?: string;
};

interface Props {
  readonly member: TeamMember;
  readonly index: number;
  readonly onRemove: (index: number) => void;
  readonly onReplace: (index: number) => void;
}

function getDisplayName(member: TeamMember): string {
  const meta = member as unknown as MemberWithMeta;
  return meta.name ?? meta.species ?? meta.id ?? "Unknown";
}

function getSpeed(member: TeamMember): number {
  return member.calculatedStats?.speed ?? 0;
}

export function TeamMemberCard({ member, index, onRemove, onReplace }: Props) {
  const displayName = getDisplayName(member);
  const speed = getSpeed(member);

  return (
    <div className="group relative flex flex-col justify-between rounded-[12px] border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-900 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-medium text-white">
          {index + 1}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Remover"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <title>Remover</title>
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-serif text-[15px] font-[550] tracking-[-0.01em] text-zinc-900">
          {displayName}
        </h3>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-[11px] tabular-nums text-zinc-500">
            SPD {speed}
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
          <div className="flex gap-1">
            {member.types.map((t) => (
              <span
                key={t}
                className="rounded-[6px] bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReplace(index)}
        className="mt-4 w-full rounded-[8px] border border-zinc-200 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900"
      >
        Reemplazar
      </button>
    </div>
  );
}
