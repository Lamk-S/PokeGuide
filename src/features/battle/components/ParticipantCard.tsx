"use client";
import { memo, useId, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { TypeBadge, getTypeStyle } from "@/components/ui/TypeBadge";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";
import type {
  Pokemon,
  PokemonAbilityRef,
  PokemonType,
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
import { MoveSelect } from "./MoveSelect";
import { ItemSelect } from "./ItemSelect";

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
  hp: { full: "PS", abbr: "HP" },
  attack: { full: "Ataque", abbr: "ATK" },
  defense: { full: "Defensa", abbr: "DEF" },
  "special-attack": { full: "At. Especial", abbr: "SPA" },
  "special-defense": { full: "Def. Especial", abbr: "SPD" },
  speed: { full: "Velocidad", abbr: "SPE" },
};

type StatValue = number | { value: number };
type PokemonTypeRef = PokemonType | { type?: { name?: string } } | string;

function getStatNumber(v: StatValue | undefined): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "value" in v)
    return (v as { value: number }).value;
  return 0;
}

function extractTypeName(t: PokemonTypeRef): string {
  if (typeof t === "string") return t;
  return t.type?.name || "unknown";
}

// --- ROW SOLO IV ---
function IvRow({
  stat,
  iv,
  liveValue,
  onChangeIV,
}: {
  stat: StatName;
  iv: number;
  liveValue: number;
  onChangeIV: (v: number) => void;
}) {
  const label = STAT_LABELS[stat];
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-[#F0F3F7] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#182033] min-w-21.25">
            {label.full}
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7B8794] bg-[#F0F3F7] px-1.5 py-0.5 rounded-sm">
            {label.abbr}
          </span>
        </div>
        <span className="text-[11px] text-[#7B8794] tabular-nums">
          Actual: {liveValue}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#5F6B7A] w-4.5">IV</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={31}
          value={iv}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            const v = Math.min(
              31,
              Math.max(0, Number.isNaN(parsed) ? 0 : parsed),
            );
            onChangeIV(v);
          }}
          className="w-14 h-8 text-center rounded-md border border-[#D9E0E8] bg-white text-[13px] font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
        />
        <input
          type="range"
          min={0}
          max={31}
          value={iv}
          onChange={(e) => onChangeIV(Number.parseInt(e.target.value, 10))}
          className="flex-1 h-1.5 appearance-none rounded-full bg-[#E6EBF1] accent-[#182033] cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onChangeIV(31)}
          className="h-6 px-2.5 rounded-md text-[10px] font-medium bg-[#182033] text-white hover:bg-black"
        >
          31
        </button>
      </div>
    </div>
  );
}

// --- ROW SOLO EV CON LIMITE RESTANTE ---
function EvRow({
  stat,
  ev,
  liveValue,
  evTotal,
  onChangeEV,
}: {
  stat: StatName;
  ev: number;
  liveValue: number;
  evTotal: number;
  onChangeEV: (v: number) => void;
}) {
  const label = STAT_LABELS[stat];
  const remaining = 510 - (evTotal - ev); // lo que quedaría disponible si quitamos este stat
  const maxForThisStat = Math.min(252, remaining);
  const canAddMore = ev < maxForThisStat;

  return (
    <div className="flex flex-col gap-2 py-3 border-b border-[#F0F3F7] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#182033] min-w-21.25">
            {label.full}
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-[#7B8794] bg-[#F0F3F7] px-1.5 py-0.5 rounded-sm">
            {label.abbr}
          </span>
          {ev > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2868B2]">
              {ev} EV
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#7B8794] tabular-nums">
          Actual: {liveValue}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#5F6B7A] w-4.5">EV</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={maxForThisStat}
          value={ev}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            const v = Math.min(
              maxForThisStat,
              Math.max(0, Number.isNaN(parsed) ? 0 : parsed),
            );
            onChangeEV(v);
          }}
          className="w-14 h-8 text-center rounded-md border border-[#D9E0E8] bg-white text-[13px] font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
        />
        <input
          type="range"
          min={0}
          max={252}
          value={ev}
          step={4}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            const v = Math.min(maxForThisStat, Math.max(0, parsed));
            onChangeEV(v);
          }}
          className="flex-1 h-1.5 appearance-none rounded-full bg-[#E6EBF1] accent-[#182033] cursor-pointer"
        />
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onChangeEV(0)}
            className="h-6 min-w-7 px-1.5 rounded-md text-[10px] font-medium bg-[#F0F3F7] hover:bg-[#E6EBF1] text-[#182033]"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => onChangeEV(maxForThisStat)}
            disabled={maxForThisStat === 0}
            className={`h-6 min-w-8 px-2 rounded-md text-[10px] font-medium transition-colors ${maxForThisStat === 0 ? "bg-[#F0F3F7] text-[#B9C4D1] cursor-not-allowed" : canAddMore || ev < maxForThisStat ? "bg-[#182033] text-white hover:bg-black" : "bg-[#E6EBF1] text-[#7B8794]"}`}
          >
            {maxForThisStat}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ParticipantCardProps {
  label: string;
  pokemonList: Pokemon[];
  input: BattleParticipantInput | null;
  onChange: (input: BattleParticipantInput | null) => void;
  facing: "left" | "right";
  generation: number;
  isAttacker?: boolean;
  moveName?: string;
  onMoveChange?: (name: string) => void;
  availableMoves?: {
    value: string;
    label: string;
    type: string;
    power: number | null;
    accuracy: number | null;
    description: string;
  }[];
  defenderTypes?: string[] | undefined;
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
}: ParticipantCardProps) {
  const levelId = useId();
  const [sections, setSections] = useState({
    ivs: false,
    evs: false,
    mods: false,
  });
  const { abilityList } = useAbilityStore();
  const { itemList } = useItemStore();

  const currentPokemon = useMemo(
    () => pokemonList.find((p) => p.id === input?.pokemonId),
    [pokemonList, input?.pokemonId],
  );

  const liveStats = useMemo(() => {
    if (!currentPokemon || !input) return null;
    try {
      return calculateStats({
        baseStats: currentPokemon.baseStats,
        level: input.level,
        nature: input.nature,
        ivs: input.ivs as unknown as Record<StatName, number>,
        evs: input.evs as unknown as Record<StatName, number>,
        generation: generation,
      });
    } catch {
      return null;
    }
  }, [currentPokemon, input, generation]);

  const evTotal = useMemo(() => {
    if (!input) return 0;
    const evsRecord = input.evs as unknown as Record<string, StatValue>;
    return Object.values(evsRecord).reduce<number>(
      (s, v) => s + getStatNumber(v),
      0,
    );
  }, [input]);

  const modifiedIVs = useMemo(() => {
    if (!input) return 0;
    const ivsRecord = input.ivs as unknown as Record<string, StatValue>;
    return Object.values(ivsRecord).filter((v) => getStatNumber(v) !== 31)
      .length;
  }, [input]);

  const modifiedEVs = useMemo(() => {
    if (!input) return 0;
    const evsRecord = input.evs as unknown as Record<string, StatValue>;
    return Object.values(evsRecord).filter((v) => getStatNumber(v) > 0).length;
  }, [input]);

  const primaryType = useMemo(() => {
    if (!currentPokemon?.types?.[0]) return null;
    return extractTypeName(currentPokemon.types[0] as PokemonTypeRef);
  }, [currentPokemon]);

  const headerBgStyle = useMemo(() => {
    if (!primaryType) return {};
    const style = getTypeStyle(primaryType);
    return {
      background: `linear-gradient(135deg, ${style.bg} 0%, white 100%)`,
      borderColor: style.border,
    };
  }, [primaryType]);

  const abilityOptions = useMemo(() => {
    if (!currentPokemon?.abilities) return [];
    return currentPokemon.abilities.map((a: PokemonAbilityRef) => {
      const name = a.name;
      const found = abilityList.find((ab) => ab.name === name);
      return {
        value: name,
        label: found?.nameEs || name,
        description: found?.effectEs?.slice(0, 60) || "",
      };
    });
  }, [currentPokemon, abilityList]);

  const natureOptions = useMemo(
    () =>
      NATURES.map((n) => ({
        value: n.name,
        label: n.nameEs,
        description: `${n.increasedStat ? `+${n.increasedStat}` : "Neutro"} ${n.decreasedStat ? `-${n.decreasedStat}` : ""} • ${n.name}`,
      })),
    [],
  );

  const currentNatureLabel = useMemo(() => {
    if (!input?.nature) return undefined;
    return input.nature.nameEs || input.nature.name;
  }, [input?.nature]);

  if (!input) {
    const isAttackerEmpty = label.toLowerCase().includes("atacante");
    const title = isAttackerEmpty
      ? "Selecciona un atacante"
      : "Selecciona un defensor";
    const description = isAttackerEmpty
      ? "Elige el Pokémon que realizará el ataque para calcular el daño."
      : "Elige el Pokémon que recibirá el ataque para calcular el daño.";
    const pokemonLabel = isAttackerEmpty
      ? "Pokémon atacante"
      : "Pokémon defensor";

    const QUICK_PICKS = [
      { id: 25, name: "Pikachu" },
      { id: 445, name: "Garchomp" },
      { id: 658, name: "Greninja" },
    ];

    const handleSelectById = (id: number) => {
      const p = pokemonList.find((x) => x.id === id);
      if (!p) return;
      const nature = SERIOUS;
      const firstAbilityName = p.abilities?.[0]?.name || "";
      onChange({
        pokemonId: id,
        level: 50,
        nature,
        evs: EV.createEmptySet() as unknown as BattleParticipantInput["evs"],
        ivs: IV.createPerfectSet() as unknown as BattleParticipantInput["ivs"],
        ability: firstAbilityName,
      } as unknown as BattleParticipantInput);
    };

    return (
      <div className="bg-[#FCFDFE] rounded-[12px] border border-dashed border-[#D0D8E2] p-5 md:p-6 flex flex-col items-center text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-visible">
        <div className="size-12 rounded-full bg-[#F0F3F7] flex items-center justify-center mb-3">
          <div className="size-6 rounded-full border border-[#B9C4D1] flex items-center justify-center text-[#7B8794]">
            <span className="text-[12px] font-bold">!</span>
          </div>
        </div>
        <h3 className="text-[15px] font-semibold text-[#182033] tracking-[-0.01em]">
          {title}
        </h3>
        <p className="text-[13px] text-[#7B8794] max-w-75 mt-1.5 leading-[1.45]">
          {description}
        </p>
        <div className="w-full mt-6 text-left">
          <Label className="text-[13px] font-medium text-[#182033]">
            {pokemonLabel}
          </Label>
          <div className="mt-2 relative">
            <PokemonSelect
              pokemonList={pokemonList}
              value=""
              onValueChange={(val) => {
                const id = Number.parseInt(val, 10);
                handleSelectById(id);
              }}
              placeholder="Busca un Pokémon..."
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 w-full">
          {QUICK_PICKS.map((qp) => (
            <button
              key={qp.id}
              type="button"
              onClick={() => handleSelectById(qp.id)}
              className="h-17 rounded-[8px] border border-[#E6EBF1] bg-white hover:bg-[#F5F7FA] hover:border-[#D0D8E2] flex flex-col items-center justify-center gap-1 transition-colors group"
            >
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${qp.id}.png`}
                alt={qp.name}
                width={28}
                height={28}
                className="size-7 object-contain group-hover:scale-110 transition-transform"
                unoptimized
              />
              <span className="text-[12px] font-medium text-[#182033]">
                {qp.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[12px] border border-[#D9E0E8] shadow-[0_1px_2px_rgba(0,0,0,0.06)] overflow-visible">
      <div
        className="p-3 md:p-4 border-b flex items-center justify-between gap-3 rounded-t-[12px]"
        style={headerBgStyle as React.CSSProperties}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="size-11 md:size-12 rounded-full bg-white border border-[#D9E0E8] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {currentPokemon ? (
              <PokemonSprite
                pokemon={{ id: currentPokemon.id, name: currentPokemon.name }}
                facing={facing}
                size={40}
                hd={false}
              />
            ) : (
              <span className="text-[#7B8794] text-xs">?</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] md:text-[15px] font-semibold tracking-[-0.01em] truncate text-[#182033]">
              {formatPokemonDisplayName(currentPokemon?.name || "")}
            </div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              {currentPokemon?.types?.map((t) => {
                const typeName = extractTypeName(t as PokemonTypeRef);
                return <TypeBadge key={typeName} type={typeName} size="sm" />;
              })}
              <span className="text-[11px] text-[#5F6B7A] ml-1">
                Nv. {input.level}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="h-7 px-2.5 rounded-md border border-[#D9E0E8] bg-white text-xs font-medium hover:bg-[#F5F7FA] shrink-0"
        >
          Cambiar
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 border-b border-[#F0F3F7] bg-[#FBFCFD]">
        {STAT_ORDER.map((st) => {
          const statVal = liveStats
            ? (liveStats as Record<string, number>)[st]
            : 0;
          const label = STAT_LABELS[st];
          return (
            <div
              key={st}
              className="p-2 md:p-2.5 text-center border-r border-b md:border-b-0 border-[#F0F3F7] last:border-r-0"
            >
              <div className="text-[10px] font-semibold tracking-widest text-[#7B8794]">
                {label.abbr}
              </div>
              <div className="text-[13px] font-semibold tabular-nums text-[#182033] mt-0.5">
                {statVal}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B8794]">
              Configuración básica
            </span>
            <span className="text-[10px] text-[#7B8794]">6 campos</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[13px] font-medium text-[#182033]">
              Pokémon
            </Label>
            <PokemonSelect
              pokemonList={pokemonList}
              value={input.pokemonId.toString()}
              onValueChange={(val) => {
                const id = Number.parseInt(val, 10);
                const p = pokemonList.find((x) => x.id === id);
                if (!p) return;
                const firstAbilityName =
                  p.abilities?.[0]?.name || input.ability;
                onChange({
                  ...input,
                  pokemonId: id,
                  ability: firstAbilityName,
                } as unknown as BattleParticipantInput);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor={`${levelId}-level`}
                className="text-[13px] font-medium text-[#182033]"
              >
                Nivel
              </Label>
              <input
                id={`${levelId}-level`}
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={input.level}
                onChange={(e) => {
                  const v = Math.min(
                    100,
                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                  );
                  onChange({ ...input, level: v });
                }}
                className="h-10 px-3 rounded-lg border border-[#D9E0E8] bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-[#D93B32]/20 focus:border-[#D93B32]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[13px] font-medium text-[#182033]">
                Naturaleza
              </Label>
              <Combobox
                options={natureOptions}
                value={input.nature.name}
                onValueChange={(val) => {
                  const nat = NATURES.find((n) => n.name === val);
                  if (nat) onChange({ ...input, nature: nat });
                }}
                placeholder={currentNatureLabel || "Naturaleza"}
              />
              {input.nature && (
                <div className="text-[11px] text-[#5F6B7A] flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[#2868B2]" />
                  {currentNatureLabel}{" "}
                  {input.nature.increasedStat
                    ? `(+${input.nature.increasedStat})`
                    : "(Neutra)"}
                </div>
              )}
            </div>
          </div>

          {isAttacker &&
            availableMoves &&
            onMoveChange &&
            moveName !== undefined && (
              <div className="flex flex-col gap-2">
                <Label className="text-[13px] font-medium text-[#182033]">
                  Movimiento
                </Label>
                <MoveSelect
                  options={availableMoves}
                  value={moveName}
                  onValueChange={onMoveChange}
                  defenderTypes={defenderTypes}
                />
              </div>
            )}

          <div className="flex flex-col gap-2">
            <Label className="text-[13px] font-medium text-[#182033]">
              Habilidad
            </Label>
            <Combobox
              options={abilityOptions}
              value={input.ability || ""}
              onValueChange={(val) => {
                if (val) {
                  onChange({ ...input, ability: val });
                } else {
                  const { ability: _removed, ...rest } =
                    input as BattleParticipantInput & { ability?: string };
                  onChange(rest as BattleParticipantInput);
                }
              }}
              placeholder="Busca habilidad..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[13px] font-medium text-[#182033]">
              Objeto{" "}
              <span className="text-[#7B8794] font-normal">(opcional)</span>
            </Label>
            <ItemSelect
              itemList={itemList as never}
              value={input.item || ""}
              onValueChange={(val) => {
                if (val) {
                  onChange({ ...input, item: val } as BattleParticipantInput);
                } else {
                  const { item: _removed, ...rest } =
                    input as BattleParticipantInput & { item?: string };
                  onChange(rest as BattleParticipantInput);
                }
              }}
              placeholder="Opcional... ej. Vidasfera"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#F0F3F7]">
        {[
          {
            key: "ivs",
            title: "IVs (Valores Individuales)",
            desc: "Rango 0–31",
            badge: modifiedIVs ? `${modifiedIVs} modificados` : undefined,
            count: "6 valores",
          },
          {
            key: "evs",
            title: "EVs (Esfuerzo)",
            desc: `${evTotal}/510`,
            badge:
              evTotal > 510
                ? "Límite superado"
                : modifiedEVs
                  ? `${modifiedEVs} modificados`
                  : undefined,
            count: `${evTotal}/510`,
          },
          {
            key: "mods",
            title: "Estados y modificadores",
            desc: "Clima, campo, estados",
            badge: undefined,
            count: "Opcional",
          },
        ].map((sec) => {
          const open = sections[sec.key as keyof typeof sections];
          const isError = sec.key === "evs" && evTotal > 510;
          return (
            <div
              key={sec.key}
              className="border-b border-[#F0F3F7] last:border-0"
            >
              <button
                type="button"
                onClick={() =>
                  setSections((s) => ({
                    ...s,
                    [sec.key]: !s[sec.key as keyof typeof s],
                  }))
                }
                aria-expanded={open}
                className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-[#F5F7FA]/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-6 rounded-md border flex items-center justify-center transition-colors shrink-0 ${open ? "bg-[#182033] border-[#182033] text-white" : "bg-white border-[#D9E0E8] text-[#7B8794]"}`}
                  >
                    <ChevronDown
                      className={`size-3 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium flex items-center gap-2 text-[#182033] truncate">
                      {sec.title}
                      {sec.badge && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${isError ? "bg-[#FEE2E2] text-[#C7373F]" : "bg-[#EFF6FF] text-[#2868B2]"}`}
                        >
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#7B8794] mt-0.5 truncate">
                      {sec.desc}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-[#7B8794] hidden md:block shrink-0 ml-2">
                  {sec.count}
                </span>
              </button>
              {open && (
                <div className="px-3 md:px-4 pb-4">
                  {sec.key === "ivs" && (
                    <div className="rounded-lg border border-[#E6EBF1] bg-[#FBFCFD] p-3">
                      {STAT_ORDER.map((st) => {
                        const ivVal =
                          getStatNumber(
                            (input.ivs as unknown as Record<string, StatValue>)[
                              st
                            ],
                          ) || 31;
                        return (
                          <IvRow
                            key={st}
                            stat={st}
                            iv={ivVal}
                            liveValue={
                              liveStats
                                ? (liveStats as Record<string, number>)[st]
                                : 0
                            }
                            onChangeIV={(v) => {
                              const newIVs = {
                                ...input.ivs,
                                [st]: v,
                              } as unknown as Record<string, StatValue>;
                              try {
                                onChange({
                                  ...input,
                                  ivs: IV.createSet(newIVs as never),
                                });
                              } catch {
                                onChange({
                                  ...input,
                                  ivs: newIVs as unknown as typeof input.ivs,
                                });
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                  {sec.key === "evs" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-[#7B8794]">
                        <span>Progreso EVs</span>
                        <span
                          className={
                            evTotal > 510 ? "text-[#C7373F] font-medium" : ""
                          }
                        >
                          {evTotal}/510{" "}
                          {510 - evTotal > 0
                            ? `· quedan ${510 - evTotal}`
                            : "· lleno"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E6EBF1] overflow-hidden">
                        <div
                          className={`h-full transition-all ${evTotal > 510 ? "bg-[#C7373F]" : evTotal === 510 ? "bg-[#16845B]" : "bg-[#182033]"}`}
                          style={{
                            width: `${Math.min(100, (evTotal / 510) * 100)}%`,
                          }}
                        />
                      </div>
                      {evTotal > 510 && (
                        <div className="text-xs text-[#C7373F] flex gap-1.5">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <title>Advertencia</title>
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              fill="none"
                            />
                            <path
                              d="M8 5v3M8 11h.01"
                              stroke="currentColor"
                              strokeLinecap="round"
                            />
                          </svg>
                          Los EVs no pueden superar 510. Reduce algunos valores.
                        </div>
                      )}
                      <div className="rounded-lg border border-[#E6EBF1] bg-[#FBFCFD] p-3">
                        {STAT_ORDER.map((st) => {
                          const evVal =
                            getStatNumber(
                              (
                                input.evs as unknown as Record<
                                  string,
                                  StatValue
                                >
                              )[st],
                            ) || 0;
                          return (
                            <EvRow
                              key={st}
                              stat={st}
                              ev={evVal}
                              evTotal={evTotal}
                              liveValue={
                                liveStats
                                  ? (liveStats as Record<string, number>)[st]
                                  : 0
                              }
                              onChangeEV={(v) => {
                                const newEVs = {
                                  ...input.evs,
                                  [st]: v,
                                } as unknown as Record<string, StatValue>;
                                try {
                                  onChange({
                                    ...input,
                                    evs: EV.createSet(newEVs as never),
                                  });
                                } catch {
                                  onChange({
                                    ...input,
                                    evs: newEVs as unknown as typeof input.evs,
                                  });
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {sec.key === "mods" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Clima: Ninguno",
                        "Campo: Ninguno",
                        "Quemado",
                        "Paralizado",
                      ].map((t) => (
                        <div
                          key={t}
                          className="h-10 rounded-lg border border-[#D9E0E8] bg-white px-3 flex items-center justify-between text-[13px] text-[#182033]"
                        >
                          <span>{t}</span>
                          <span className="size-4 rounded-sm border border-[#D9E0E8]" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
