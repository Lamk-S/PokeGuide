import { parsePokemonIdentity } from "../value-objects/PokemonIdentity";
import type { PokemonIdentity } from "../value-objects/PokemonIdentity";

interface PokemonLike {
  id: number;
  name: string;
  baseStats?: Record<string, number>;
  stats?: Record<string, number>;
  [key: string]: unknown;
}

export interface ResolvedPokemonForm {
  identity: PokemonIdentity;
  basePokemon: PokemonLike | null;
  formPokemon: PokemonLike | null;
  isValid: boolean;
  reason?: string;
  statsSource: "form" | "base" | "none";
}

function hasStats(p: PokemonLike | null): boolean {
  if (!p) return false;
  return Boolean(p.stats || p.baseStats);
}

function getStats(p: PokemonLike | null): Record<string, number> | null {
  if (!p) return null;
  if (p.stats && typeof p.stats === "object")
    return p.stats as Record<string, number>;
  if (p.baseStats && typeof p.baseStats === "object")
    return p.baseStats as Record<string, number>;
  return null;
}

export function resolvePokemonForm(
  identity: PokemonIdentity,
  pokemonList: Array<PokemonLike>,
): ResolvedPokemonForm {
  const formPokemon =
    pokemonList.find((p) => p.id === identity.numericId) || null;

  if (!formPokemon) {
    return {
      identity,
      basePokemon: null,
      formPokemon: null,
      isValid: false,
      reason: `No se encontró Pokémon con ID ${identity.numericId}`,
      statsSource: "none",
    };
  }

  const candidates = pokemonList.filter((p) => {
    const cand = parsePokemonIdentity({ id: p.id, name: p.name });
    return (
      cand.speciesId === identity.speciesId &&
      (cand.formId === "base" ||
        cand.formId === "50" ||
        cand.formId === "50-power-construct")
    );
  });

  const basePokemon = candidates.sort((a, b) => a.id - b.id)[0] || formPokemon;

  if (!hasStats(formPokemon) && !hasStats(basePokemon)) {
    return {
      identity,
      basePokemon,
      formPokemon,
      isValid: false,
      reason: `La forma ${identity.originalName} (ID ${identity.numericId}) no tiene estadísticas`,
      statsSource: "none",
    };
  }

  const statsSource = hasStats(formPokemon) ? "form" : "base";

  return {
    identity,
    basePokemon,
    formPokemon,
    isValid: true,
    statsSource,
  };
}

export function resolvePokemonStats(resolvedForm: ResolvedPokemonForm) {
  if (!resolvedForm.isValid) return null;
  const formStats = getStats(resolvedForm.formPokemon);
  if (formStats) return { baseStats: formStats, source: "form" as const };
  const baseStats = getStats(resolvedForm.basePokemon);
  if (baseStats) return { baseStats, source: "base" as const };
  return null;
}

export function resolvePokemon(
  identity: PokemonIdentity,
  pokemonList: Array<PokemonLike>,
) {
  const r = resolvePokemonForm(identity, pokemonList);
  return r.formPokemon || r.basePokemon || null;
}
