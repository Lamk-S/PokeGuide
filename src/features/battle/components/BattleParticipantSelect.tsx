"use client";
import type { Pokemon } from "@/domain/pokemon/types/pokemon";
import type { BattleParticipantInput } from "@/features/battle/store/useBattleStore";
import type { Item } from "@/domain/items/types/item";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useId, useMemo } from "react";
import { NATURES } from "@/domain/stats/constants/natures";
import { useAbilityStore } from "@/features/abilities/store/useAbilityStore";

const SERIOUS = NATURES.find((n) => n.name === "Serious") || NATURES[0];

export function BattleParticipantSelect({
  label,
  pokemonList,
  itemList,
  onSelect,
  disabled,
  currentInput,
}: {
  label: string;
  pokemonList: Pokemon[];
  itemList: Item[];
  onSelect: (i: BattleParticipantInput | null) => void;
  disabled?: boolean;
  currentInput?: BattleParticipantInput | null;
}) {
  const levelId = useId();
  const natureId = useId();

  // Extraemos el listado global de habilidades para resolver los nombres en español
  const { abilityList } = useAbilityStore();

  const pokemonOptions = useMemo(
    () => pokemonList.map((p) => ({ value: p.id.toString(), label: p.name })),
    [pokemonList],
  );

  const currentPokemon = useMemo(
    () => pokemonList.find((p) => p.id === currentInput?.pokemonId),
    [pokemonList, currentInput?.pokemonId],
  );

  // Mapeamos las habilidades legales cruzándolas con la metadata en español
  const abilityOptions = useMemo(() => {
    if (!currentPokemon) return [];

    return currentPokemon.abilities.map((abilityRef) => {
      const metadata = abilityList.find((a) => a.name === abilityRef.name);
      const nameDisplay = metadata ? metadata.nameEs : abilityRef.name;
      const hiddenTag = abilityRef.isHidden ? " (Oculta)" : "";

      return {
        value: abilityRef.name,
        label: `${nameDisplay}${hiddenTag}`,
        description: metadata?.effectEs,
      };
    });
  }, [currentPokemon, abilityList]);

  const itemOptions = useMemo(
    () =>
      itemList.map((i) => ({
        value: i.name,
        label: i.nameEs,
        description: i.effectEs || i.effect,
      })),
    [itemList],
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Combobox
          options={pokemonOptions}
          value={currentInput?.pokemonId?.toString() || ""}
          onValueChange={(val) => {
            const pid = parseInt(val, 10);
            if (Number.isNaN(pid)) {
              onSelect(null);
              return;
            }
            const newPokemon = pokemonList.find((p) => p.id === pid);

            const validAbility = newPokemon?.abilities.some(
              (a) => a.name === currentInput?.ability,
            )
              ? currentInput?.ability
              : undefined;

            const newInput: BattleParticipantInput = {
              pokemonId: pid,
              level: currentInput?.level || 50,
              nature: currentInput?.nature || SERIOUS,
              ivs: currentInput?.ivs || {
                hp: 31,
                attack: 31,
                defense: 31,
                "special-attack": 31,
                "special-defense": 31,
                speed: 31,
              },
              evs: currentInput?.evs || {
                hp: 0,
                attack: 252,
                defense: 0,
                "special-attack": 0,
                "special-defense": 0,
                speed: 252,
              },
            };

            if (validAbility) newInput.ability = validAbility;
            if (currentInput?.item) newInput.item = currentInput.item;

            onSelect(newInput);
          }}
          placeholder="Busca un Pokémon..."
          emptyMessage="Pokémon no encontrado."
          disabled={disabled ?? false}
        />
      </div>

      {currentInput && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={levelId}>Nivel</Label>
            <input
              id={levelId}
              type="number"
              min={1}
              max={100}
              value={currentInput.level}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (Number.isNaN(val)) val = 1;
                if (val > 100) val = 100;
                if (val < 1) val = 1;
                onSelect({ ...currentInput, level: val });
              }}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={natureId}>Naturaleza</Label>
            <select
              id={natureId}
              value={currentInput.nature.name}
              onChange={(e) => {
                const nat =
                  NATURES.find((n) => n.name === e.target.value) || SERIOUS;
                onSelect({ ...currentInput, nature: nat });
              }}
              className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {NATURES.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name}{" "}
                  {n.increasedStat
                    ? `(+${n.increasedStat.substring(0, 3)} -${n.decreasedStat?.substring(0, 3)})`
                    : "(Neutra)"}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {currentInput && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label>Habilidad (Opcional)</Label>
            <Combobox
              options={abilityOptions}
              value={currentInput.ability || ""}
              onValueChange={(val) => {
                const next = { ...currentInput };
                if (val) {
                  next.ability = val;
                } else {
                  delete next.ability;
                }
                onSelect(next);
              }}
              placeholder="Selecciona habilidad..."
              emptyMessage="Sin habilidades."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Objeto (Opcional)</Label>
            <Combobox
              options={itemOptions}
              value={currentInput.item || ""}
              onValueChange={(val) => {
                const next = { ...currentInput };
                if (val) {
                  next.item = val;
                } else {
                  delete next.item;
                }
                onSelect(next);
              }}
              placeholder="Selecciona objeto..."
              emptyMessage="Objeto no encontrado."
            />
          </div>
        </div>
      )}
    </div>
  );
}
