"use client";
import { memo, useId, useMemo, useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type {
  Pokemon,
  PokemonAbilityRef,
} from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { NATURES } from "@/domain/stats/constants/natures";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { PokemonSelect } from "./PokemonSelect";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonForm } from "@/domain/pokemon/services/PokemonFormResolver";
import { MoveSelect } from "./MoveSelect";
import { ItemSelect } from "./ItemSelect";
import { BattleFieldControls } from "./BattleFieldControls";
import {
  Status,
  type StatusId,
} from "@/domain/battle/value-objects/BattleModifiers";
import { useBattleStore } from "../store/useBattleStore";
import {
  getStatNumber,
  extractTypeName,
  type StatValue,
  type PokemonTypeRef,
} from "@/domain/pokemon/utils/pokemonHelpers";
import type { BaseStats } from "@/domain/stats/types/StatTypes";

const SERIOUS = NATURES.find((n) => n.name === "Serious") || NATURES[0];
const STAT_ORDER: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
const STAT_LABELS: Record<StatName, { full: string; abbr: string }> = {
  hp: { full: "PS", abbr: "PS" },
  attack: { full: "ATQ", abbr: "ATQ" },
  defense: { full: "DEF", abbr: "DEF" },
  "special-attack": { full: "ATE", abbr: "ATE" },
  "special-defense": { full: "DFE", abbr: "DFE" },
  speed: { full: "VEL", abbr: "VEL" },
};

type MoveOption = {
  value: string;
  label: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  description: string;
};
type FormResolverPokemon = {
  id: number;
  name: string;
  baseStats?: BaseStats;
  types?: PokemonTypeRef[];
  abilities?: Array<{ name: string }>;
};

function CompactStatGrid({
  liveStats,
}: {
  liveStats: Record<StatName, number> | null;
}) {
  return (
    <div className="grid grid-cols-6 border border-[#EDE8E0] rounded-lg overflow-hidden bg-[#FFFEFB]">
      {STAT_ORDER.map((st) => (
        <div
          key={st}
          className="px-1.5 py-2 text-center border-r last:border-r-0 border-[#F0EDE6] flex flex-col gap-0.5"
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#9A9590]">
            {STAT_LABELS[st].abbr}
          </div>
          <div className="text-[13px] font-mono font-bold tabular-nums">
            {liveStats ? liveStats[st] : 0}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ParticipantCard = memo(function ParticipantCard({
  label,
  pokemonList,
  input,
  onChange,
  facing,
  generation,
  isAttacker,
  moveName,
  onMoveChange,
  availableMoves,
  defenderTypes,
}: {
  label: string;
  pokemonList: Pokemon[];
  input: BattleParticipantInput | null;
  onChange: (input: BattleParticipantInput | null) => void;
  facing: "left" | "right";
  generation: number;
  isAttacker?: boolean;
  moveName?: string;
  onMoveChange?: (name: string) => void;
  availableMoves?: MoveOption[];
  defenderTypes?: string[];
}) {
  const levelId = useId();
  const [openIV, setOpenIV] = useState(false);
  const [openEV, setOpenEV] = useState(true);
  const [openMods, setOpenMods] = useState(false);
  const { abilityList } = useAbilityStore();
  const { itemList } = useItemStore();
  const conditions = useBattleStore((s) => s.conditions);
  const setConditions = useBattleStore((s) => s.setConditions);

  const currentPokemon = useMemo(
    () => pokemonList.find((p) => p.id === input?.pokemonId),
    [pokemonList, input?.pokemonId],
  );
  const identity = useMemo(
    () =>
      currentPokemon
        ? parsePokemonIdentity({
            id: currentPokemon.id,
            name: currentPokemon.name,
          })
        : null,
    [currentPokemon],
  );
  const resolvedForm = useMemo(
    () =>
      identity
        ? resolvePokemonForm(
            identity,
            pokemonList as unknown as FormResolverPokemon[],
          )
        : null,
    [identity, pokemonList],
  );

  const liveStats = useMemo(() => {
    if (!currentPokemon || !input) return null;
    const base =
      resolvedForm?.formPokemon?.baseStats ||
      resolvedForm?.basePokemon?.baseStats ||
      (currentPokemon as unknown as { baseStats?: BaseStats }).baseStats;
    if (!base) return null;
    try {
      return calculateStats({
        baseStats: base as unknown as BaseStats,
        level: input.level,
        nature: input.nature,
        ivs: input.ivs as unknown as Record<StatName, number>,
        evs: input.evs as unknown as Record<StatName, number>,
        generation,
      }) as Record<StatName, number>;
    } catch {
      return null;
    }
  }, [currentPokemon, resolvedForm, input, generation]);

  const evTotal = useMemo(() => {
    if (!input) return 0;
    return Object.values(
      input.evs as unknown as Record<string, StatValue>,
    ).reduce<number>((s, v) => s + getStatNumber(v), 0);
  }, [input]);

  const abilityOptions = useMemo(() => {
    if (!currentPokemon?.abilities) return [];
    return currentPokemon.abilities.map((a: PokemonAbilityRef) => {
      const found = abilityList.find((ab) => ab.name === a.name);
      return { value: a.name, label: found?.nameEs || a.name };
    });
  }, [currentPokemon, abilityList]);

  const natureOptions = useMemo(
    () => NATURES.map((n) => ({ value: n.name, label: n.nameEs || n.name })),
    [],
  );
  const statusOptions = useMemo(
    () => Object.values(Status).map((s) => ({ value: s.id, label: s.label })),
    [],
  );

  if (!input) {
    const isAtk = label.toLowerCase().includes("atacante");
    const QUICK = [
      { id: 6, name: "Charizard" },
      { id: 3, name: "Venusaur" },
      { id: 445, name: "Garchomp" },
    ];
    const select = (id: number) => {
      const p = pokemonList.find((x) => x.id === id);
      if (!p) return;
      onChange({
        pokemonId: id,
        level: 50,
        nature: SERIOUS,
        evs: EV.createEmptySet(),
        ivs: IV.createPerfectSet(),
        ability: p.abilities?.[0]?.name || "",
        status: "none",
      } as unknown as BattleParticipantInput);
    };
    return (
      <div className="bg-[#FFFEFB] rounded-xl border border-dashed border-[#D9CFC2] p-6 flex flex-col gap-4 min-h-70 justify-between">
        <div className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold">
            {isAtk ? "Selecciona atacante" : "Selecciona defensor"}
          </h3>
          <PokemonSelect
            pokemonList={pokemonList}
            value=""
            onValueChange={(val) => select(parseInt(val, 10))}
            placeholder="Busca un Pokémon..."
          />
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          <div className="grid grid-cols-3 gap-2">
            {QUICK.map((qp) => (
              <button
                key={qp.id}
                type="button"
                onClick={() => select(qp.id)}
                className="h-18 rounded-lg border border-[#EDE8E0] bg-white flex flex-col items-center justify-center gap-1 hover:bg-[#F8F5F0] hover:border-[#D9CFC2] transition-colors"
              >
                <PokemonSprite
                  pokemon={{ id: qp.id, name: qp.name.toLowerCase() }}
                  size={28}
                />
                <span className="text-[11px] font-medium">{qp.name}</span>
              </button>
            ))}
          </div>
          <div className="h-18 rounded-lg bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center">
            <span className="text-[10px] font-mono text-[#9A9590] uppercase tracking-widest">
              Elige un Pokémon
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEFB] rounded-xl border border-[#EDE8E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-visible">
      {/* Header */}
      <div className="p-3 flex items-start justify-between gap-3">
        <div className="flex gap-3 min-w-0">
          <div className="size-16 rounded-xl bg-[#F8F5F0] border border-[#EDE8E0] flex items-center justify-center overflow-hidden shrink-0">
            {currentPokemon ? (
              <PokemonSprite
                pokemon={{ id: currentPokemon.id, name: currentPokemon.name }}
                facing={facing}
                size={52}
              />
            ) : (
              "?"
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[16px] font-bold tracking-[-0.01em] leading-none">
              {formatPokemonDisplayName(currentPokemon?.name || "")}
            </div>
            <div className="text-[10px] font-mono text-[#9A9590] mt-1">
              {currentPokemon
                ? `${identity?.speciesId || ""}:base #${String(currentPokemon.id).padStart(4, "0")}`
                : ""}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {currentPokemon?.types?.map((t) => {
                const tn = extractTypeName(t as PokemonTypeRef);
                return <TypeBadge key={tn} type={tn} size="sm" />;
              })}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-[11px] font-medium text-[#9A9590] underline underline-offset-4 decoration-dotted hover:text-[#111]"
        >
          Cambiar
        </button>
      </div>

      <div className="px-3 pb-3">
        <CompactStatGrid liveStats={liveStats} />
      </div>

      <div className="px-3 pb-3 space-y-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
            Pokémon
          </Label>
          <PokemonSelect
            pokemonList={pokemonList}
            value={input.pokemonId.toString()}
            onValueChange={(val) => {
              const id = parseInt(val, 10);
              const p = pokemonList.find((x) => x.id === id);
              if (!p) return;
              onChange({
                ...input,
                pokemonId: id,
                ability: p.abilities?.[0]?.name || input.ability,
              } as BattleParticipantInput);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label
              htmlFor={`${levelId}-level`}
              className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]"
            >
              Nivel
            </Label>
            <input
              id={`${levelId}-level`}
              type="number"
              min={1}
              max={100}
              value={input.level}
              onChange={(e) =>
                onChange({
                  ...input,
                  level: Math.min(
                    100,
                    Math.max(1, parseInt(e.target.value, 10) || 1),
                  ),
                })
              }
              className="h-8 w-full px-2.5 rounded-md border border-[#E8E0D6] bg-white text-[13px] font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
              Naturaleza
            </Label>
            <Combobox
              options={natureOptions}
              value={input.nature.name}
              onValueChange={(val) => {
                const nat = NATURES.find((n) => n.name === val);
                if (nat) onChange({ ...input, nature: nat });
              }}
              placeholder="—"
            />
          </div>
        </div>

        {isAttacker &&
          availableMoves &&
          onMoveChange &&
          moveName !== undefined && (
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
                Movimiento
              </Label>
              <MoveSelect
                options={availableMoves}
                value={moveName}
                onValueChange={onMoveChange}
                defenderTypes={defenderTypes}
                attackerTypes={
                  currentPokemon?.types
                    ?.map((t) => extractTypeName(t as PokemonTypeRef))
                    .filter(Boolean) as string[]
                }
              />
              <div className="text-[10px] font-mono text-[#9A9590] leading-snug">
                {availableMoves.find((m) => m.value === moveName)
                  ?.description || "—"}
              </div>
            </div>
          )}

        {!isAttacker && (
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
              Movimiento recibido
            </Label>
            <Combobox
              options={[{ value: "none", label: "—" }]}
              value="none"
              onValueChange={() => {}}
              placeholder="—"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
              Habilidad
            </Label>
            <Combobox
              options={abilityOptions}
              value={input.ability || ""}
              onValueChange={(val) => {
                if (val) onChange({ ...input, ability: val });
                else {
                  const { ability: _a, ...rest } = input;
                  onChange(rest as BattleParticipantInput);
                }
              }}
              placeholder="—"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590]">
              Objeto
            </Label>
            <ItemSelect
              itemList={itemList as never}
              value={input.item || ""}
              onValueChange={(val) => {
                if (val) onChange({ ...input, item: val });
                else {
                  const { item: _i, ...rest } = input;
                  onChange(rest as BattleParticipantInput);
                }
              }}
              placeholder="—"
            />
          </div>
        </div>
      </div>

      {/* Collapsibles */}
      <div className="border-t border-[#F0EDE6] divide-y divide-[#F0EDE6]">
        <div>
          <button
            type="button"
            onClick={() => setOpenIV(!openIV)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F8F5F0]"
          >
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#1A1A1A]">
              Valores Individuales 0–31
            </span>
            <ChevronDown
              className={`size-3.5 text-[#9A9590] transition-transform ${openIV ? "rotate-180" : ""}`}
            />
          </button>
          {openIV && (
            <div className="px-3 pb-3 grid grid-cols-3 gap-2">
              {STAT_ORDER.map((st) => {
                const iv =
                  getStatNumber(
                    (input.ivs as unknown as Record<string, StatValue>)[st],
                  ) || 31;
                return (
                  <div key={st} className="space-y-1">
                    <span className="text-[10px] font-mono text-[#9A9590] uppercase">
                      {STAT_LABELS[st].abbr}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={31}
                      value={iv}
                      onChange={(e) => {
                        const v = Math.min(
                          31,
                          Math.max(0, parseInt(e.target.value, 10) || 0),
                        );
                        const newIVs = {
                          ...(input.ivs as unknown as Record<string, number>),
                          [st]: v,
                        };
                        try {
                          onChange({ ...input, ivs: IV.createSet(newIVs) });
                        } catch {
                          onChange({
                            ...input,
                            ivs: newIVs as unknown as BattleParticipantInput["ivs"],
                          });
                        }
                      }}
                      className="h-7 w-full px-2 rounded-md border border-[#E8E0D6] text-[12px] font-mono"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setOpenEV(!openEV)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F8F5F0]"
          >
            <span className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#1A1A1A]">
                Esfuerzo
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${evTotal > 510 ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]" : "bg-[#F8F5F0] border-[#EDE8E0] text-[#9A9590]"}`}
              >
                {evTotal}/510
              </span>
            </span>
            <ChevronDown
              className={`size-3.5 text-[#9A9590] transition-transform ${openEV ? "rotate-180" : ""}`}
            />
          </button>
          {openEV && (
            <div className="px-3 pb-3 space-y-2.5">
              {STAT_ORDER.map((st) => {
                const ev =
                  getStatNumber(
                    (input.evs as unknown as Record<string, StatValue>)[st],
                  ) || 0;
                const remaining = 510 - (evTotal - ev);
                const maxFor = Math.min(252, remaining);
                return (
                  <div key={st} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono w-7 text-[#9A9590]">
                      {STAT_LABELS[st].abbr}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={252}
                      step={4}
                      value={ev}
                      onChange={(e) => {
                        const v = Math.min(
                          maxFor,
                          Math.max(0, parseInt(e.target.value, 10)),
                        );
                        const newEVs = {
                          ...(input.evs as unknown as Record<string, number>),
                          [st]: v,
                        };
                        try {
                          onChange({ ...input, evs: EV.createSet(newEVs) });
                        } catch {
                          onChange({
                            ...input,
                            evs: newEVs as unknown as BattleParticipantInput["evs"],
                          });
                        }
                      }}
                      className="flex-1 accent-[#111] h-1"
                    />
                    <input
                      type="number"
                      min={0}
                      max={maxFor}
                      value={ev}
                      onChange={(e) => {
                        const v = Math.min(
                          maxFor,
                          Math.max(0, parseInt(e.target.value, 10) || 0),
                        );
                        const newEVs = {
                          ...(input.evs as unknown as Record<string, number>),
                          [st]: v,
                        };
                        try {
                          onChange({ ...input, evs: EV.createSet(newEVs) });
                        } catch {
                          onChange({
                            ...input,
                            evs: newEVs as unknown as BattleParticipantInput["evs"],
                          });
                        }
                      }}
                      className="h-6 w-12 px-1 rounded-md border border-[#E8E0D6] text-[11px] font-mono text-center"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setOpenMods(!openMods)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F8F5F0]"
          >
            <span className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#1A1A1A]">
              Estado y modificadores
            </span>
            <ChevronDown
              className={`size-3.5 text-[#9A9590] transition-transform ${openMods ? "rotate-180" : ""}`}
            />
          </button>
          {openMods && (
            <div className="px-3 pb-3 space-y-3">
              <BattleFieldControls />
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-[0.08em] font-semibold text-[#9A9590] flex items-center gap-1">
                  Estado alterado <Info className="size-3" />
                </Label>
                <Combobox
                  options={statusOptions}
                  value={input.status ?? "none"}
                  onValueChange={(v) =>
                    onChange({ ...input, status: v as StatusId })
                  }
                  placeholder="Ninguno"
                />
                <p className="text-[10px] text-[#9A9590] leading-snug">
                  {(() => {
                    const map: Record<string, string> = {
                      none: "Sin estado alterado.",
                      burn: "Quemado reduce Ataque físico 50% y causa daño residual.",
                      paralyze:
                        "Paralizado reduce Velocidad 50% y puede impedir moverse.",
                      paralysis:
                        "Paralizado reduce Velocidad 50% y puede impedir moverse.",
                      poison: "Envenenado causa daño residual cada turno.",
                      "badly-poisoned":
                        "Gravemente envenenado, daño creciente cada turno.",
                      sleep: "Dormido no puede atacar por 1-3 turnos.",
                      freeze: "Congelado no puede atacar hasta descongelarse.",
                      envenenado: "Envenenado causa daño residual cada turno.",
                      quemado: "Quemado reduce Ataque físico 50%.",
                      paralizado: "Paralizado reduce Velocidad 50%.",
                    };
                    const s = (input.status as string) || "none";
                    return (
                      map[s] ||
                      map[s.toLowerCase()] ||
                      "Selecciona un estado para ver su efecto en combate."
                    );
                  })()}
                </p>
              </div>
              <label className="flex items-center gap-2 text-[11px] font-mono">
                <input
                  type="checkbox"
                  checked={conditions.isCriticalHit ?? false}
                  onChange={(e) =>
                    setConditions({ isCriticalHit: e.target.checked })
                  }
                  className="rounded"
                />
                Golpe crítico (×1.5)
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
