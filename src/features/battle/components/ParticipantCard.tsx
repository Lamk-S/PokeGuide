"use client";
import * as React from "react";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { StatName } from "@/domain/pokemon/types/pokemon";
import { ParticipantStatsEditor } from "./ParticipantStatsEditor";
import { calculateStats } from "@/domain/stats/services/StatCalculator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { NATURES } from "@/domain/stats/constants/natures";
import { IV } from "@/domain/stats/value-objects/IV";
import { EV } from "@/domain/stats/value-objects/EV";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";
import { useItemStore } from "@/features/items/store/useItemStore";
import { PokemonSprite } from "@/components/ui/PokemonSprite";
import { formatPokemonDisplayName } from "@/domain/pokemon/services/PokemonDisplayName";

interface Props {
  label: string;
  pokemonList: Pokemon[];
  input: BattleParticipantInput | null;
  onChange: (input: BattleParticipantInput | null) => void;
  facing: "left" | "right";
  generation: number;
}

const SERIOUS = NATURES.find((n) => n.name === "Serious") || NATURES[0];
const STAT_ORDER: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];
const STAT_ABBR: Record<StatName, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};
const EMPTY_EVS = {
  hp: 0,
  attack: 0,
  defense: 0,
  "special-attack": 0,
  "special-defense": 0,
  speed: 0,
};

export const ParticipantCard = React.memo(function ParticipantCard({
  label,
  pokemonList,
  input,
  onChange,
  facing,
  generation,
}: Props) {
  const levelId = React.useId();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { abilityList } = useAbilityStore();
  const { itemList } = useItemStore();

  const currentPokemon = React.useMemo(
    () => pokemonList.find((p) => p.id === input?.pokemonId),
    [pokemonList, input?.pokemonId],
  );
  const pokemonOptions = React.useMemo(
    () =>
      pokemonList.map((p) => ({
        value: p.id.toString(),
        label: formatPokemonDisplayName(p.name),
      })),
    [pokemonList],
  );

  const abilityOptions = React.useMemo(() => {
    if (!currentPokemon) return [];
    return currentPokemon.abilities
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((ref) => {
        const meta = abilityList.find((a) => a.name === ref.name);
        return {
          value: ref.name,
          label: `${meta ? meta.nameEs : ref.name}${ref.isHidden ? " (Oculta)" : ""}`,
          description: meta?.effectEs,
        };
      });
  }, [currentPokemon, abilityList]);

  const itemOptions = React.useMemo(
    () =>
      itemList.map((i) => ({
        value: i.name,
        label: i.nameEs,
        description: i.effectEs || i.effect,
      })),
    [itemList],
  );

  const liveStats = React.useMemo(() => {
    if (!currentPokemon || !input) return null;
    return calculateStats({
      baseStats: currentPokemon.baseStats,
      level: input.level,
      nature: input.nature,
      ivs: input.ivs,
      evs: input.evs,
      generation,
    });
  }, [currentPokemon, input, generation]);

  const handlePokemonSelect = (val: string) => {
    const pid = parseInt(val, 10);
    if (Number.isNaN(pid)) return onChange(null);
    const p = pokemonList.find((x) => x.id === pid);
    if (!p) return;
    let validAbility = p.abilities.some((a) => a.name === input?.ability)
      ? input?.ability
      : undefined;
    if (!validAbility && p.abilities.length > 0) {
      const nonHidden = p.abilities.find((a) => !a.isHidden);
      validAbility = nonHidden?.name ?? p.abilities[0]?.name;
    }
    const next: BattleParticipantInput = {
      pokemonId: pid,
      level: input?.level ?? 50,
      nature: input?.nature ?? SERIOUS,
      ivs: input?.ivs ?? IV.createPerfectSet(),
      evs: input?.evs ?? EV.createSet(EMPTY_EVS),
    };
    if (validAbility) next.ability = validAbility;
    if (input?.item) next.item = input.item;
    onChange(next);
    setIsExpanded(true);
  };

  if (!input || !currentPokemon) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/70 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] self-start w-full">
        <span className="text- uppercase tracking-[0.15em] text-zinc-400 font-medium">
          {label}
        </span>
        <Combobox
          options={pokemonOptions}
          value=""
          onValueChange={handlePokemonSelect}
          placeholder="Busca un Pokémon..."
          emptyMessage="No encontrado."
        />
      </div>
    );
  }

  const displayName = formatPokemonDisplayName(currentPokemon.name);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] self-start w-full">
      {/* HEADER */}
      <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 min-h- max-h-">
        <div className="w-11 h-11 flex items-center justify-center bg-white border border-zinc-100 rounded-lg shrink-0">
          <PokemonSprite
            key={`${currentPokemon.id}-${currentPokemon.name}`}
            pokemon={{ id: currentPokemon.id, name: currentPokemon.name }}
            facing={facing}
            size={44}
            hd={false}
          />
        </div>

        {/* info central */}
        <div className="min-w-0 flex flex-col gap-0.5">
          <span className="text- uppercase tracking-[0.15em] text-zinc-400 font-medium leading-none">
            {label}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className="text-[13.5px] font-medium tracking-tight truncate leading-tight text-zinc-900"
              title={displayName}
            >
              {displayName}
            </h3>
            <span className="shrink-0 bg-zinc-900 text-white text- leading-none px-1.5 py-0.5 rounded tabular-nums">
              Lv.{input.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text- text-zinc-500 min-w-0 truncate">
            <span className="truncate">{input.nature.nameEs}</span>
            <span className="text-zinc-300">·</span>
            {input.ability && (
              <span className="truncate capitalize">{input.ability}</span>
            )}
            {input.item && (
              <>
                <span className="text-zinc-300">·</span>
                <span className="truncate">{input.item}</span>
              </>
            )}
          </div>
        </div>

        {/* stats */}
        <div className="flex items-center gap-1 self-center">
          {liveStats && (
            <div className="hidden md:grid grid-cols-6 gap-0 divide-x divide-zinc-100 border-l border-zinc-100 pl-3">
              {STAT_ORDER.map((s) => (
                <div key={s} className="min-w- text-center px-1">
                  <div className="text- font-semibold uppercase tracking-widest text-zinc-400 leading-none mb-1">
                    {STAT_ABBR[s]}
                  </div>
                  <div className="text-[11.5px] font-medium tabular-nums text-zinc-700 leading-none">
                    {liveStats[s]}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* stats mobile */}
      {liveStats && (
        <div className="md:hidden grid grid-cols-3 divide-x divide-y divide-zinc-100 border-t border-zinc-100 bg-zinc-50/40">
          {STAT_ORDER.map((s) => (
            <div key={s} className="text-center py-2">
              <div className="text- font-semibold uppercase tracking-widest text-zinc-400">
                {STAT_ABBR[s]}
              </div>
              <div className="text- font-medium tabular-nums text-zinc-700 mt-0.5">
                {liveStats[s]}
              </div>
            </div>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="border-t border-zinc-100 p-4 flex flex-col gap-5 bg-white">
          <div className="flex flex-col gap-2">
            <Label className="text- font-medium uppercase tracking-[0.12em] text-zinc-500">
              Cambiar Pokémon
            </Label>
            <Combobox
              options={pokemonOptions}
              value={input.pokemonId.toString()}
              onValueChange={handlePokemonSelect}
              placeholder="Busca..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-5 border-b border-zinc-100">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={levelId}
                className="text- font-medium uppercase tracking-[0.12em] text-zinc-500"
              >
                Nivel
              </Label>
              <input
                id={levelId}
                type="number"
                min={1}
                max={100}
                value={input.level}
                onChange={(e) => {
                  let v = parseInt(e.target.value, 10);
                  if (Number.isNaN(v) || v < 1) v = 1;
                  if (v > 100) v = 100;
                  onChange({ ...input, level: v });
                }}
                className="h-8 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 text- focus:outline-none focus:ring-1 focus:ring-zinc-300"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text- font-medium uppercase tracking-[0.12em] text-zinc-500">
                Habilidad
              </Label>
              <Combobox
                options={abilityOptions}
                value={input.ability || ""}
                onValueChange={(val) => {
                  const n = { ...input };
                  if (val) n.ability = val;
                  else delete n.ability;
                  onChange(n);
                }}
                placeholder="Opcional..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text- font-medium uppercase tracking-[0.12em] text-zinc-500">
                Objeto
              </Label>
              <Combobox
                options={itemOptions}
                value={input.item || ""}
                onValueChange={(val) => {
                  const n = { ...input };
                  if (val) n.item = val;
                  else delete n.item;
                  onChange(n);
                }}
                placeholder="Opcional..."
              />
            </div>
          </div>

          <ParticipantStatsEditor
            input={input}
            onChange={onChange}
            generation={generation}
          />
        </div>
      )}
    </div>
  );
});
