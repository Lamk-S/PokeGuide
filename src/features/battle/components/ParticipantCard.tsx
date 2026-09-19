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

interface ParticipantCardProps {
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
}: ParticipantCardProps) {
  const levelId = React.useId();
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { abilityList } = useAbilityStore();
  const { itemList } = useItemStore();

  const currentPokemon = React.useMemo(
    () => pokemonList.find((p) => p.id === input?.pokemonId),
    [pokemonList, input?.pokemonId],
  );

  const pokemonOptions = React.useMemo(
    () => pokemonList.map((p) => ({ value: p.id.toString(), label: p.name })),
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
    const newPokemon = pokemonList.find((p) => p.id === pid);
    if (!newPokemon) return;

    let validAbility = newPokemon.abilities.some(
      (a) => a.name === input?.ability,
    )
      ? input?.ability
      : undefined;

    if (!validAbility && newPokemon.abilities.length > 0) {
      const nonHidden = newPokemon.abilities.find((a) => !a.isHidden);
      validAbility = nonHidden ? nonHidden.name : newPokemon.abilities[0].name;
    }

    const newInput: BattleParticipantInput = {
      pokemonId: pid,
      level: input?.level ?? 50,
      nature: input?.nature ?? SERIOUS,
      ivs: input?.ivs ?? IV.createPerfectSet(),
      evs: input?.evs ?? EV.createSet(EMPTY_EVS),
    };
    if (validAbility) newInput.ability = validAbility;
    if (input?.item) newInput.item = input.item;
    onChange(newInput);
    setIsExpanded(true);
  };

  if (!input || !currentPokemon) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
        <Label className="text-lg font-bold">{label}</Label>
        <Combobox
          options={pokemonOptions}
          value=""
          onValueChange={handlePokemonSelect}
          placeholder="Busca un Pokémon..."
          emptyMessage="Pokémon no encontrado."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-4">
          <div className="w- h- flex items-center justify-center bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 shrink-0">
            <PokemonSprite
              key={`${currentPokemon.id}-${currentPokemon.name}`}
              pokemon={{ id: currentPokemon.id, name: currentPokemon.name }}
              facing={facing}
              size={88}
              hd={false}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold capitalize">
              {currentPokemon.name}{" "}
              <span className="text-sm font-normal text-zinc-500">
                Lv. {input.level}
              </span>
            </h3>
            <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              <span className="font-medium px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">
                {input.nature.nameEs} ({input.nature.name})
              </span>
              {input.ability && (
                <span className="capitalize">• {input.ability}</span>
              )}
              {input.item && <span>• {input.item}</span>}
            </div>
          </div>
        </div>

        {liveStats && (
          <div className="hidden xl:flex gap-3 text-xs text-center border-l border-zinc-200 dark:border-zinc-700 pl-4">
            {STAT_ORDER.map((stat) => (
              <div key={stat} className="flex flex-col min-w-">
                <span className="uppercase text-zinc-400 font-bold text-">
                  {STAT_ABBR[stat]}
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {liveStats[stat]}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 ml-2 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* BODY */}
      {isExpanded && (
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2">
          <div className="mb-6 flex flex-col gap-2">
            <Label className="text-sm font-semibold">Cambiar Pokémon</Label>
            <Combobox
              options={pokemonOptions}
              value={input.pokemonId.toString()}
              onValueChange={handlePokemonSelect}
              placeholder="Busca un Pokémon..."
              emptyMessage="Pokémon no encontrado."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex flex-col gap-2">
              <Label htmlFor={levelId} className="text-sm font-semibold">
                Nivel
              </Label>
              <input
                id={levelId}
                type="number"
                min={1}
                max={100}
                value={input.level}
                onChange={(e) => {
                  let val = parseInt(e.target.value, 10);
                  if (Number.isNaN(val) || val < 1) val = 1;
                  if (val > 100) val = 100;
                  onChange({ ...input, level: val });
                }}
                className="h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Habilidad</Label>
              <Combobox
                options={abilityOptions}
                value={input.ability || ""}
                onValueChange={(val) => {
                  const next = { ...input };
                  if (val) next.ability = val;
                  else delete next.ability;
                  onChange(next);
                }}
                placeholder="Opcional..."
                emptyMessage="Sin habilidades legales."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Objeto</Label>
              <Combobox
                options={itemOptions}
                value={input.item || ""}
                onValueChange={(val) => {
                  const next = { ...input };
                  if (val) next.item = val;
                  else delete next.item;
                  onChange(next);
                }}
                placeholder="Opcional..."
                emptyMessage="Objeto no encontrado."
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
