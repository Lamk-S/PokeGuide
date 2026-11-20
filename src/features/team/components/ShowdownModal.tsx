"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  parseShowdownTeam,
  serializeToShowdown,
} from "@/application/team/ShowdownParser";
import { resolveBaseName } from "@/domain/pokemon/mappers/PokemonIdMapper";
import type { PokemonType, StatName } from "@/domain/pokemon/types/pokemon";
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
import { LocalPokemonRepository } from "@/infrastructure/local-data/repositories/local-pokemon.repository";
import { useTeamStore } from "../store/useTeamStore";

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly mode: "import" | "export";
}

function displayNameEs(rawName: string): string {
  return rawName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildMemberFromParsed(
  parsed: ReturnType<typeof parseShowdownTeam>[number],
  full: Awaited<ReturnType<typeof LocalPokemonRepository.getByName>>,
): TeamMember | null {
  if (!full) return null;
  const baseRaw = full.baseStats as unknown as
    | Record<StatName, number>
    | undefined;
  const safeBase: BaseStats = {
    hp: baseRaw?.hp ?? 80,
    attack: baseRaw?.attack ?? 80,
    defense: baseRaw?.defense ?? 80,
    "special-attack": baseRaw?.["special-attack"] ?? 80,
    "special-defense": baseRaw?.["special-defense"] ?? 80,
    speed: baseRaw?.speed ?? 80,
  };
  const natureName = parsed.nature ?? "Hardy";
  const nature: Nature = NATURES.find(
    (n) => n.name.toLowerCase() === natureName.toLowerCase(),
  ) ??
    NATURES[0] ?? {
      name: "Hardy",
      nameEs: "Fuerte",
      increasedStat: null,
      decreasedStat: null,
    };
  const evsRaw = parsed.evs as Record<string, number> | undefined;
  const evsDist: Record<StatName, number> = {
    hp: evsRaw?.hp ?? 0,
    attack: evsRaw?.attack ?? 0,
    defense: evsRaw?.defense ?? 0,
    "special-attack": evsRaw?.["special-attack"] ?? 0,
    "special-defense": evsRaw?.["special-defense"] ?? 0,
    speed: evsRaw?.speed ?? 0,
  };
  const ivs = IV.createPerfectSet();
  const evs = EV.createSet(evsDist);
  const calculated = calculateStats({
    baseStats: safeBase,
    ivs,
    evs,
    level: parsed.level ?? DEFAULT_BATTLE_RULESET.level,
    nature,
    generation: DEFAULT_BATTLE_RULESET.generation,
  });
  const calc = calculated as unknown as Record<StatName, number>;
  return Object.freeze({
    id: String(full.id),
    pokemonId: full.id,
    name: normalizeId(full.name),
    displayNameEs: full.displayNameEs || displayNameEs(full.name),
    species: resolveBaseName(full.name),
    types: full.types as readonly PokemonType[],
    abilityId: parsed.ability ? normalizeId(parsed.ability) : null,
    itemId: parsed.item ? normalizeId(parsed.item) : null,
    ability: parsed.ability ?? null,
    item: parsed.item ?? null,
    nature,
    level: parsed.level ?? DEFAULT_BATTLE_RULESET.level,
    evs: evs as unknown as EVSet,
    ivs: ivs as unknown as EVSet,
    calculatedStats: {
      hp: calc.hp,
      attack: calc.attack,
      defense: calc.defense,
      specialAttack: calc["special-attack"],
      specialDefense: calc["special-defense"],
      speed: calc.speed,
    },
    baseStats: safeBase,
    moves: Object.freeze([...parsed.moves]),
    teraType: parsed.teraType
      ? (normalizeId(parsed.teraType) as PokemonType)
      : null,
    isTeraActive: false,
  }) as TeamMember;
}

export function ShowdownModal({ open, onClose, mode }: Props) {
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const team = useTeamStore((s) => s.team);
  const addMember = useTeamStore((s) => s.addMember);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    if (mode === "export") {
      const members = team.getMembers();
      const serialized = serializeToShowdown(
        members.map((m) => ({
          id: m.id,
          name: m.name,
          displayNameEs: m.displayNameEs,
          englishName: m.name,
          itemId: m.itemId,
          item: m.item,
          abilityId: m.abilityId,
          ability: m.ability,
          level: m.level,
          evs: m.evs as unknown as Record<string, number>,
          nature: m.nature,
          moves: m.moves,
          teraType: m.teraType,
        })),
      );
      setText(serialized);
      setStatus(null);
    } else {
      setText("");
      setStatus(null);
    }
  }, [open, mode, team]);

  const handleImport = async () => {
    try {
      setStatus("Importando...");
      const parsed = parseShowdownTeam(text);
      if (parsed.length === 0) {
        setStatus("No se detectaron Pokémon en el texto");
        return;
      }
      let imported = 0;
      for (const p of parsed) {
        const full =
          (await LocalPokemonRepository.getByName(p.name)) ??
          (await LocalPokemonRepository.getByNameEs(p.name));
        const searchFallback = full
          ? null
          : (await LocalPokemonRepository.search(p.name))[0];
        const source = full ?? searchFallback ?? null;
        if (!source) continue;
        const member = buildMemberFromParsed(p, source);
        if (!member) continue;
        await addMember(member);
        imported += 1;
      }
      setStatus(`Importados ${imported} Pokémon correctamente`);
      window.setTimeout(() => onClose(), 800);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Error importando");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setStatus("Copiado al portapapeles");
  };

  if (!open || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[#EDE8E0] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EDE8E0] px-6 py-4">
          <div>
            <h2 className="text-[14px] font-semibold text-[#111]">
              {mode === "import"
                ? "Importar desde Showdown"
                : "Exportar a Showdown"}
            </h2>
            <p className="mt-1 text-[11px] text-zinc-600">
              {mode === "import"
                ? "Pega texto compatible con Pokémon Showdown"
                : "Texto listo para simuladores (HP, Atk, Def, SpA, SpD, Spe)"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#EDE8E0] bg-white px-3 py-1 text-[11px] text-zinc-600 hover:border-[#111] hover:text-[#111]"
          >
            Cerrar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              mode === "import"
                ? "Pikachu @ Light Ball\nAbility: Static\nLevel: 50"
                : ""
            }
            className="min-h-80 w-full resize-y border border-[#EDE8E0] bg-[#F8F5F0] p-3 font-mono text-[12px] leading-relaxed outline-none focus:border-[#111] focus:bg-white"
          />
          {status && (
            <div className="mt-3 border border-[#EDE8E0] bg-[#F8F5F0] px-3 py-2 text-[11px] text-zinc-700">
              {status}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#EDE8E0] bg-[#FFFEFB] px-6 py-4">
          {mode === "export" && (
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="rounded-lg border border-[#EDE8E0] px-4 py-2 text-[12px]"
            >
              Copiar
            </button>
          )}
          {mode === "import" ? (
            <button
              type="button"
              onClick={() => void handleImport()}
              className="rounded-lg bg-[#111] px-4 py-2 text-[12px] text-white"
            >
              Importar equipo
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#111] px-4 py-2 text-[12px] text-white"
            >
              Listo
            </button>
          )}
        </div>
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
}
