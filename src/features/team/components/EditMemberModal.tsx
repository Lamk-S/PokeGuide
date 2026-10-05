"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type {
  TeamMember,
  EVSet,
  IVSet,
  BaseStats,
} from "@/domain/team/types/TeamTypes";
import type { Nature } from "@/domain/stats/types/StatTypes";
import { NATURES } from "@/domain/stats/constants/natures";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";
import {
  COMPETITIVE_ITEMS,
  translateItemToSpanish,
} from "../constants/competitiveItems";
import {
  COMPETITIVE_ABILITIES,
  translateAbilityToSpanish,
} from "../constants/competitiveAbilities";
import { DEFAULT_BATTLE_RULESET } from "@/domain/team/config/battleFormat";
import { normalizeId } from "@/domain/shared/utils/normalizeId";
import type { StatName } from "@/domain/pokemon/types/pokemon";

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

function clampEV(value: number): number {
  return Math.max(0, Math.min(252, Math.floor(value)));
}

function totalEVs(evs: EVSet): number {
  return Object.values(evs).reduce((a, b) => a + b, 0);
}

export function EditMemberModal({
  open,
  onClose,
  member,
  index,
  onSave,
}: Props) {
  const [itemId, setItemId] = useState<string>("");
  const [abilityId, setAbilityId] = useState<string>("");
  const [nature, setNature] = useState<Nature>(NATURES[0]);
  const [evs, setEvs] = useState<EVSet>({
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  });
  const [level, setLevel] = useState(DEFAULT_BATTLE_RULESET.level);

  useEffect(() => {
    if (member) {
      setItemId(member.itemId ?? member.item ?? "");
      setAbilityId(member.abilityId ?? member.ability ?? "");
      setNature(
        member.nature ?? NATURES.find((n) => n.name === "Hardy") ?? NATURES[0],
      );
      setEvs(member.evs);
      setLevel(member.level);
    }
  }, [member]);

  const currentTotal = useMemo(() => totalEVs(evs), [evs]);
  const remaining = 510 - currentTotal;
  const isInvalid = currentTotal > 510;

  const handleEVChange = (key: EVKey, rawValue: number) => {
    const clamped = clampEV(rawValue);
    const otherTotal = currentTotal - evs[key];
    const maxAllowed = Math.min(252, 510 - otherTotal);
    const finalValue = Math.min(clamped, maxAllowed);
    setEvs((prev) => ({ ...prev, [key]: finalValue }));
  };

  const handleSave = () => {
    if (!member || index === null) return;

    const baseStats: BaseStats = member.baseStats;

    const ivs = IV.createPerfectSet();
    const evSet = EV.createSet(evs);

    const calculated = calculateStats({
      baseStats: baseStats as unknown as Record<StatName, number>,
      ivs,
      evs: evSet,
      level,
      nature,
      generation: DEFAULT_BATTLE_RULESET.generation,
    });

    const updated: TeamMember = {
      ...member,
      abilityId: abilityId || null,
      itemId: itemId || null,
      ability: abilityId || null,
      item: itemId || null,
      nature,
      level,
      evs: evSet as unknown as EVSet,
      ivs: ivs as unknown as IVSet,
      calculatedStats: {
        hp: calculated.hp,
        attack: calculated.attack,
        defense: calculated.defense,
        specialAttack: calculated["special-attack"],
        specialDefense: calculated["special-defense"],
        speed: calculated.speed,
      },
      baseStats,
    };

    onSave(index, updated);
    onClose();
  };

  if (!open || !member || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111]/30 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-160 flex-col border border-[#EDE8E0] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
        <div className="border-b border-[#EDE8E0] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-[18px] font-semibold tracking-[-0.02em] text-[#111]">
                Perfil competitivo
              </h2>
              <p className="mt-1 text-[12px] leading-normal text-zinc-600">
                {member.displayNameEs} · #{String(member.id).padStart(3, "0")} ·
                Nv. {level} · {nature.nameEs}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border border-[#EDE8E0] bg-white px-2.5 py-1 text-[11px] text-zinc-600 hover:border-[#111] hover:text-[#111]"
              aria-label="Cerrar editor"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px]">
            <span className="border border-[#111] bg-[#111] px-2 py-1 text-white">
              NV. {level}
            </span>
            <span className="border border-[#EDE8E0] bg-[#F8F5F0] px-2 py-1 tabular-nums text-zinc-700">
              {currentTotal}/510 EVs · Restantes: {remaining}
            </span>
            {isInvalid ? (
              <span className="border border-[#D93B32] bg-[#FEF2F2] px-2 py-1 text-[#991B1B]">
                Excede límite
              </span>
            ) : remaining === 0 ? (
              <span className="border border-emerald-200 bg-[#F0FDF4] px-2 py-1 text-emerald-800">
                Óptimo
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#111]">
              Configuración competitiva
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-item"
                  className="text-[11px] uppercase tracking-widest text-zinc-500"
                >
                  Objeto · ID estable
                </label>
                <select
                  id="edit-item"
                  value={itemId}
                  onChange={(e) => setItemId(normalizeId(e.target.value))}
                  className="mt-1.5 w-full border border-[#EDE8E0] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#111]"
                >
                  {COMPETITIVE_ITEMS.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.nameEs} · {it.descriptionEs}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {translateItemToSpanish(itemId) || "Sin objeto"}
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-ability"
                  className="text-[11px] uppercase tracking-widest text-zinc-500"
                >
                  Habilidad · ID estable
                </label>
                <select
                  id="edit-ability"
                  value={abilityId}
                  onChange={(e) => setAbilityId(normalizeId(e.target.value))}
                  className="mt-1.5 w-full border border-[#EDE8E0] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#111]"
                >
                  {COMPETITIVE_ABILITIES.map((ab) => (
                    <option key={ab.id} value={ab.id}>
                      {ab.nameEs} · {ab.descriptionEs}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {abilityId
                    ? `${translateAbilityToSpanish(abilityId)}${abilityId === "levitate" ? " → Inmune Tierra" : ""}`
                    : "Sin habilidad"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-nature"
                  className="text-[11px] uppercase tracking-widest text-zinc-500"
                >
                  Naturaleza
                </label>
                <select
                  id="edit-nature"
                  value={nature.name}
                  onChange={(e) => {
                    const found = NATURES.find(
                      (n) => n.name === e.target.value,
                    );
                    if (found) setNature(found);
                  }}
                  className="mt-1.5 w-full border border-[#EDE8E0] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#111]"
                >
                  {NATURES.map((n) => (
                    <option key={n.name} value={n.name}>
                      {n.nameEs} ({n.name}){" "}
                      {n.increasedStat
                        ? `+${n.increasedStat} -${n.decreasedStat}`
                        : "Neutro"}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-zinc-500">
                  {nature.nameEs}{" "}
                  {nature.increasedStat
                    ? `↑${nature.increasedStat} ↓${nature.decreasedStat}`
                    : "Sin cambio"}{" "}
                  · Afecta cálculo final
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-level"
                  className="text-[11px] uppercase tracking-widest text-zinc-500"
                >
                  Nivel · {DEFAULT_BATTLE_RULESET.generationLabelEs}
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    id="edit-level"
                    type="range"
                    min={1}
                    max={100}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="flex-1 accent-[#111]"
                  />
                  <span className="w-12 border border-[#EDE8E0] bg-white px-2 py-1 text-center text-[12px] tabular-nums">
                    {level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#EDE8E0] bg-[#F8F5F0] px-6 py-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#111]">
                Esfuerzo (EVs) · Máx 252 por stat · 510 total
              </h3>
              <button
                type="button"
                onClick={() =>
                  setEvs({
                    hp: 0,
                    attack: 0,
                    defense: 0,
                    "special-attack": 0,
                    "special-defense": 0,
                    speed: 0,
                  })
                }
                className="text-[11px] text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-[#111] hover:decoration-[#111]"
              >
                Resetear
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {EV_KEYS.map((key) => (
                <div key={key} className="border border-[#EDE8E0] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-[#111]">
                      {EV_LABELS[key]}
                    </span>
                    <span className="text-[11px] tabular-nums text-zinc-600">
                      {evs[key]} / 252
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={252}
                      step={4}
                      value={evs[key]}
                      onChange={(e) =>
                        handleEVChange(key, Number(e.target.value))
                      }
                      className="flex-1 accent-[#111]"
                      aria-label={`EVs ${EV_LABELS[key]}`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={252}
                      value={evs[key]}
                      onChange={(e) =>
                        handleEVChange(key, Number(e.target.value))
                      }
                      className="w-16 border border-[#EDE8E0] bg-white px-2 py-1 text-[12px] tabular-nums outline-none focus:border-[#111]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-4 border px-3 py-2 text-[11px] ${isInvalid ? "border-[#D93B32] bg-[#FEF2F2] text-[#991B1B]" : "border-[#111] bg-[#111] text-white"}`}
            >
              Total: {currentTotal} / 510 · Restantes: {remaining}{" "}
              {remaining === 0 ? "· Perfecto competitivo" : ""}{" "}
              {isInvalid ? "· Corrige antes de guardar" : ""}
            </div>
          </div>
        </div>

        <div className="border-t border-[#EDE8E0] bg-white px-6 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#EDE8E0] bg-white px-5 py-2.5 text-[13px] font-medium text-zinc-700 hover:border-[#111] hover:text-[#111]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isInvalid}
              className="flex-1 bg-[#111] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-black disabled:opacity-40"
            >
              Guardar y recalcular
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-zinc-500">
            Gen {DEFAULT_BATTLE_RULESET.generation} · Nv.{level} · 31 IVs ·
            Cálculo determinista sin RNG
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
