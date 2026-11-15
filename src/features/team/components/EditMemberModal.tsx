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
import { ItemSelect } from "@/features/battle/components/ItemSelect";
import { COMPETITIVE_ITEMS as BATTLE_COMPETITIVE_ITEMS } from "@/features/battle/constants/competitiveItems";
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import {
  COMPETITIVE_ABILITIES,
  translateAbilityToSpanish,
} from "../constants/competitiveAbilities";
import { MoveSelector } from "./MoveSelector";

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

function clampEV(value: number): number {
  return Math.max(0, Math.min(252, Math.floor(value)));
}

function totalEVs(evs: EVSet): number {
  return (Object.values(evs) as number[]).reduce((a, b) => a + b, 0);
}

type MutableEVSet = { -readonly [K in EVKey]: number };

function extractAbilityIds(raw: readonly unknown[] | undefined): string[] {
  if (!raw) return [];
  const ids: string[] = [];
  for (const entry of raw) {
    if (typeof entry === "string" && entry.trim()) {
      ids.push(normalizeId(entry));
    } else if (entry && typeof entry === "object") {
      const obj = entry as Record<string, unknown>;
      const cand = obj.id ?? obj.name ?? obj.ability ?? obj.slug ?? obj.key;
      if (typeof cand === "string" && cand.trim()) ids.push(normalizeId(cand));
      else if (obj.ability && typeof obj.ability === "object") {
        const inner = obj.ability as Record<string, unknown>;
        const innerCand = inner.name ?? inner.id;
        if (typeof innerCand === "string") ids.push(normalizeId(innerCand));
      }
    }
  }
  return [...new Set(ids.filter(Boolean))];
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
  const [nature, setNature] = useState<Nature>(NATURES[0] ?? FALLBACK_NATURE);
  const [evs, setEvs] = useState<EVSet>({
    hp: 0,
    attack: 0,
    defense: 0,
    "special-attack": 0,
    "special-defense": 0,
    speed: 0,
  });
  const [level, setLevel] = useState<number>(DEFAULT_BATTLE_RULESET.level);
  const [selectedMoves, setSelectedMoves] = useState<readonly string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [legalAbilityIds, setLegalAbilityIds] = useState<readonly string[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (member) {
      setItemId(member.itemId ?? member.item ?? "");
      setAbilityId(member.abilityId ?? member.ability ?? "");
      setNature(member.nature ?? NATURES[0] ?? FALLBACK_NATURE);
      setEvs(member.evs);
      setLevel(member.level);
      setSelectedMoves(member.moves);
    }
  }, [member]);

  useEffect(() => {
    if (!member) {
      setLegalAbilityIds([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const full = await LocalPokemonRepository.getById(member.pokemonId);
        if (cancelled) return;
        const ids = extractAbilityIds(
          full?.abilities as readonly unknown[] | undefined,
        );
        setLegalAbilityIds(ids);
      } catch {
        if (!cancelled) setLegalAbilityIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [member]);

  const availableAbilities = useMemo(() => {
    if (legalAbilityIds.length === 0) {
      if (!abilityId) return [];
      const found = (COMPETITIVE_ABILITIES as readonly unknown[]).find((a) => {
        const rawId =
          typeof a === "string"
            ? a
            : (((a as Record<string, unknown>).id as string) ??
              ((a as Record<string, unknown>).name as string) ??
              "");
        return normalizeId(rawId) === normalizeId(abilityId);
      });
      return found ? [found] : [];
    }
    const filtered = (COMPETITIVE_ABILITIES as readonly unknown[]).filter(
      (raw) => {
        const rawId =
          typeof raw === "string"
            ? raw
            : (((raw as Record<string, unknown>).id as string) ??
              ((raw as Record<string, unknown>).name as string) ??
              "");
        return legalAbilityIds.includes(normalizeId(rawId));
      },
    );
    if (filtered.length === 0) return legalAbilityIds.map((id) => id);
    return filtered;
  }, [legalAbilityIds, abilityId]);

  const total = useMemo(() => totalEVs(evs), [evs]);

  const handleEVChange = (key: EVKey, value: number) => {
    setEvs((prev) => {
      const clamped = clampEV(value);
      const next = { ...prev } as MutableEVSet;
      next[key] = clamped;
      const currentTotal = totalEVs(next as EVSet);
      if (currentTotal <= 510) return next as EVSet;
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
      return next as EVSet;
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

  const calcRecord = calculated as Record<StatName, number>;

  const handleSave = () => {
    const updated: TeamMember = Object.freeze({
      ...member,
      itemId: itemId ? normalizeId(itemId) : null,
      item: itemId ? itemId : null,
      abilityId: abilityId ? normalizeId(abilityId) : null,
      ability: abilityId ? abilityId : null,
      nature: Object.freeze({ ...nature }),
      evs: Object.freeze({ ...evs }),
      level,
      moves: Object.freeze([...selectedMoves]),
      calculatedStats: Object.freeze({
        hp: calcRecord.hp,
        attack: calcRecord.attack,
        defense: calcRecord.defense,
        specialAttack: calcRecord["special-attack"],
        specialDefense: calcRecord["special-defense"],
        speed: calcRecord.speed,
      }),
    }) as TeamMember;

    onSave(index, updated);
    onClose();
  };

  const abilityOptions = availableAbilities as readonly unknown[];

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E0D8] bg-[#FFFEFB] px-6 py-4">
          <div>
            <h2 className="font-serif text-[16px] font-semibold text-[#111]">
              Editar {member.displayNameEs}
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {member.displayNameEs.toLowerCase()} · #
              {String(member.pokemonId).padStart(3, "0")} · Nv. {level} ·{" "}
              {nature.nameEs}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E0D8] bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:border-[#111] hover:text-[#111]"
          >
            Cerrar
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-12">
          <div className="col-span-1 space-y-5 border-r border-[#F0EBE3] p-6 lg:col-span-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="edit-ability-select"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600"
                >
                  Habilidad del Pokémon
                </label>
                <select
                  id="edit-ability-select"
                  value={abilityId}
                  onChange={(e) => setAbilityId(e.target.value)}
                  className="w-full border border-[#E5E0D8] bg-white px-3 py-2.5 text-[12px] text-[#111] outline-none focus:border-[#111]"
                >
                  <option value="">Sin habilidad</option>
                  {abilityOptions.map((raw) => {
                    const id =
                      typeof raw === "string"
                        ? normalizeId(raw)
                        : normalizeId(
                            ((raw as Record<string, unknown>).id as string) ??
                              ((raw as Record<string, unknown>)
                                .name as string) ??
                              "",
                          );
                    const label =
                      typeof raw === "string"
                        ? (translateAbilityToSpanish(raw) as string)
                        : (translateAbilityToSpanish(id) as string);
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1.5 text-[10px] text-zinc-500">
                  {legalAbilityIds.length > 0
                    ? `${legalAbilityIds.length} habilidad${legalAbilityIds.length > 1 ? "es" : ""} disponible${legalAbilityIds.length > 1 ? "s" : ""} para esta especie`
                    : "Habilidades según Pokédex oficial"}
                </p>
              </div>

              <div>
                <div className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Objeto competitivo
                </div>
                <ItemSelect
                  itemList={BATTLE_COMPETITIVE_ITEMS}
                  value={itemId}
                  onValueChange={setItemId}
                  placeholder="Sin objeto"
                />
                <p className="mt-1.5 text-[10px] text-zinc-500">
                  {BATTLE_COMPETITIVE_ITEMS.length} objetos equipables · sprites
                  oficiales de PokeAPI
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-nature-select"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600"
                  >
                    Naturaleza
                  </label>
                  <select
                    id="edit-nature-select"
                    value={nature.name}
                    onChange={(e) => {
                      const found = NATURES.find(
                        (n) => n.name === e.target.value,
                      );
                      if (found) setNature(found);
                    }}
                    className="w-full border border-[#E5E0D8] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#111]"
                  >
                    {NATURES.map((n) => (
                      <option key={n.name} value={n.name}>
                        {n.nameEs} ({n.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-level-input"
                    className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-zinc-600"
                  >
                    Nivel
                  </label>
                  <input
                    id="edit-level-input"
                    type="number"
                    min={1}
                    max={100}
                    value={level}
                    onChange={(e) =>
                      setLevel(
                        Math.max(
                          1,
                          Math.min(100, Number(e.target.value) || 50),
                        ),
                      )
                    }
                    className="w-full border border-[#E5E0D8] bg-white px-3 py-2.5 text-[12px] outline-none focus:border-[#111]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                  Esfuerzos (EVs)
                </div>
                <span
                  className={`text-[10px] font-medium ${total > 510 ? "text-red-600" : total === 510 ? "text-emerald-700" : "text-zinc-600"}`}
                >
                  {total}/510
                </span>
              </div>
              <div className="space-y-3">
                {EV_KEYS.map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-16 text-[10px] font-medium uppercase tracking-widest text-zinc-700">
                      {EV_LABELS[k]}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={252}
                      step={4}
                      value={evs[k] ?? 0}
                      onChange={(e) =>
                        handleEVChange(k, Number(e.target.value))
                      }
                      className="h-1 flex-1 accent-[#111]"
                    />
                    <input
                      type="number"
                      min={0}
                      max={252}
                      value={evs[k] ?? 0}
                      onChange={(e) =>
                        handleEVChange(k, Number(e.target.value))
                      }
                      className="w-16 border border-[#E5E0D8] bg-[#FFFEFB] px-2 py-1 text-right text-[11px] outline-none focus:border-[#111]"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-6 gap-2 border-t border-[#F0EBE3] pt-3">
                {EV_KEYS.map((k) => (
                  <div key={k} className="text-center">
                    <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                      {EV_LABELS[k]}
                    </div>
                    <div className="text-[11px] font-semibold text-[#111]">
                      {calcRecord[k] ?? "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-[#FFFEFB] p-6 lg:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Movimientos
              </h3>
              <span className="text-[10px] text-zinc-500">
                {selectedMoves.length}/4 seleccionados · Solo movimientos
                aprendibles
              </span>
            </div>
            <MoveSelector
              pokemonId={member.pokemonId}
              selectedMoves={selectedMoves}
              onChange={setSelectedMoves}
              maxMoves={4}
            />
            <div className="mt-4 rounded-lg border border-[#E5E0D8] bg-white p-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold uppercase tracking-widest text-zinc-600">
                  Estado
                </span>
                <span
                  className={`font-medium ${selectedMoves.length === 4 ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {selectedMoves.length === 4
                    ? "Set completo"
                    : `${4 - selectedMoves.length} pendiente`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E5E0D8] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-zinc-600 hover:text-[#111]"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-[#111] px-5 py-2 text-[12px] font-medium text-white hover:bg-black"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
