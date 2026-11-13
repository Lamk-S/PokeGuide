"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import { NATURES } from "@/domain/stats/constants/natures";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { EV } from "@/domain/stats/value-objects/EV";
import { IV } from "@/domain/stats/value-objects/IV";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import type {
  BaseStats,
  EVSet,
  TeamMember,
} from "@/domain/team/types/TeamTypes";
import {
  COMPETITIVE_ABILITIES,
  translateAbilityToSpanish,
} from "../constants/competitiveAbilities";
import {
  COMPETITIVE_ITEMS,
  translateItemToSpanish,
} from "../constants/competitiveItems";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly member: TeamMember | null;
  readonly index: number | null;
  readonly onSave: (index: number, updated: TeamMember) => void;
}

type EVKey = keyof EVSet;
const EV_KEYS: readonly EVKey[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;
const EV_LABELS: Record<EVKey, string> = {
  hp: "PS",
  attack: "ATQ",
  defense: "DEF",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "VEL",
};
const FALLBACK_NATURE: Nature = {
  name: "Hardy",
  nameEs: "Fuerte",
  increasedStat: null,
  decreasedStat: null,
};

type ExtendedMember = TeamMember & {
  readonly displayNameEs?: string;
  readonly item?: string | null;
  readonly ability?: string | null;
};

function clampEV(value: number): number {
  return Math.max(0, Math.min(252, Math.floor(value)));
}
function totalEVs(evs: EVSet): number {
  return (Object.values(evs) as number[]).reduce((a, b) => a + b, 0);
}
type MutableEVSet = { -readonly [K in EVKey]: number };

export function EditMemberModal({
  open,
  onClose,
  member,
  index,
  onSave,
}: Props) {
  const [itemId, setItemId] = useState<string>("");
  const [abilityId, setAbilityId] = useState<string>("");
  const [nature, setNature] = useState<Nature>(NATURES[0] ?? FALLBACK_NATURE);
  const [evs, setEvs] = useState<EVSet>({
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  });
  const [level, setLevel] = useState<number>(50);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (member) {
      const ext = member as ExtendedMember;
      setItemId(member.itemId ?? ext.item ?? "");
      setAbilityId(member.abilityId ?? ext.ability ?? "");
      setNature(member.nature ?? NATURES[0] ?? FALLBACK_NATURE);
      setEvs(member.evs as unknown as EVSet);
      setLevel(member.level);
    }
  }, [member]);

  const total = useMemo(() => totalEVs(evs), [evs]);

  const handleEVChange = (key: EVKey, value: number) => {
    setEvs((prev) => {
      const clamped = clampEV(value);
      const next = { ...prev } as MutableEVSet;
      next[key] = clamped;
      const currentTotal = totalEVs(next as unknown as EVSet);
      if (currentTotal <= 510) return next as unknown as EVSet;
      let excess = currentTotal - 510;
      const otherKeys = EV_KEYS.filter((k) => k !== key).sort(
        (a, b) => (next[b] ?? 0) - (next[a] ?? 0),
      );
      for (const k of otherKeys) {
        if (excess <= 0) break;
        const available = next[k] ?? 0;
        const reduce = Math.min(available, excess);
        next[k] = available - reduce;
        excess -= reduce;
      }
      return next as unknown as EVSet;
    });
  };

  if (!open || !member || index === null || !mounted) return null;

  const baseStats: BaseStats = member.baseStats;
  const ivs = IV.createPerfectSet();
  const evSet = EV.createSet(evs as unknown as Record<StatName, number>);

  const calculated = calculateStats({
    baseStats,
    level,
    nature,
    ivs: ivs as unknown as Record<StatName, number>,
    evs: evSet,
    generation: DEFAULT_BATTLE_RULESET.generation,
  });

  const calcRecord = calculated as unknown as Record<StatName, number>;

  const extMember = member as ExtendedMember;

  const handleSave = () => {
    const updated = {
      ...member,
      itemId: itemId ? normalizeId(itemId) : null,
      abilityId: abilityId ? normalizeId(abilityId) : null,
      nature,
      evs: evs as unknown as typeof member.evs,
      level,
      calculatedStats: {
        hp: calcRecord.hp,
        attack: calcRecord.attack,
        defense: calcRecord.defense,
        specialAttack: calcRecord["special-attack"],
        specialDefense: calcRecord["special-defense"],
        speed: calcRecord.speed,
      },
    } as unknown as TeamMember;
    onSave(index, updated);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-160 overflow-y-auto rounded-xl border border-[#EDE8E0] bg-white">
        <div className="sticky top-0 border-b border-[#EDE8E0] bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111]">
                Editar {extMember.displayNameEs ?? member.name}
              </h2>
              <p className="mt-1 text-[12px] leading-normal text-zinc-600">
                {extMember.displayNameEs ?? member.name} · #
                {String(member.id).padStart(3, "0")} · Nv. {level} ·{" "}
                {nature.nameEs}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] text-zinc-500 hover:text-zinc-800"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-ability"
                className="text-[11px] uppercase tracking-widest"
              >
                Habilidad competitiva
              </label>
              <select
                id="edit-ability"
                value={abilityId}
                onChange={(e) => setAbilityId(e.target.value)}
                className="mt-2 w-full border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[12px]"
              >
                <option value="">Sin habilidad</option>
                {COMPETITIVE_ABILITIES.map((ab) => (
                  <option key={ab.id} value={ab.id}>
                    {translateAbilityToSpanish(ab.id)} ({ab.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-item"
                className="text-[11px] uppercase tracking-widest"
              >
                Objeto competitivo
              </label>
              <select
                id="edit-item"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="mt-2 w-full border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[12px]"
              >
                <option value="">Sin objeto</option>
                {COMPETITIVE_ITEMS.map((it) => (
                  <option key={it.id} value={it.id}>
                    {translateItemToSpanish(it.id)} ({it.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-nature"
              className="text-[11px] uppercase tracking-widest"
            >
              Naturaleza
            </label>
            <select
              id="edit-nature"
              value={nature.name}
              onChange={(e) => {
                const found = NATURES.find((n) => n.name === e.target.value);
                if (found) setNature(found);
              }}
              className="mt-2 w-full border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[12px]"
            >
              {NATURES.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.nameEs} ({n.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest">
                EVs · {total}/510
              </span>
              <span className="text-[11px] text-zinc-500">
                Nv. {DEFAULT_BATTLE_RULESET.level} · Gen{" "}
                {DEFAULT_BATTLE_RULESET.generation}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {EV_KEYS.map((key) => (
                <div
                  key={key}
                  className="grid grid-cols-[60px_1fr_40px] items-center gap-3"
                >
                  <span className="text-[11px] text-[#111]">
                    {EV_LABELS[key]}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={252}
                    step={4}
                    value={evs[key] ?? 0}
                    onChange={(e) =>
                      handleEVChange(key, Number(e.target.value))
                    }
                    className="h-1 w-full"
                  />
                  <span className="text-[11px] tabular-nums">
                    {evs[key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#EDE8E0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#EDE8E0] px-4 py-2 text-[12px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#111] px-4 py-2 text-[12px] text-white"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
