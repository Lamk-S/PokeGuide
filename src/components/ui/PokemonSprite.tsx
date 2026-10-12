"use client";
import Image from "next/image";
import { useState, useMemo } from "react";

interface Props {
  readonly pokemon: { id: number; name: string };
  readonly size?: number;
  readonly facing?: "left" | "right";
  readonly className?: string;
}

function pad4(id: number) {
  return String(Math.abs(id)).padStart(4, "0");
}

function isGmaxName(name: string) {
  const n = name.toLowerCase();
  return n.includes("gmax") || n.includes("gigantamax");
}

export function PokemonSprite({
  pokemon,
  size = 56,
  facing = "left",
  className,
}: Props) {
  const [failed, setFailed] = useState(false);

  const dexId = useMemo(() => {
    if (pokemon.id < 10000) return pokemon.id;
    return pokemon.id % 1000;
  }, [pokemon.id]);

  const nameLower = pokemon.name.toLowerCase();
  const isGmax = isGmaxName(nameLower);

  const primaryUrl = useMemo(() => {
    const padded = pad4(dexId);
    if (isGmax)
      return `https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/${padded}-Gmax.png`;
    return `https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/images/${padded}.png`;
  }, [dexId, isGmax]);

  const fallbackUrl = useMemo(() => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;
  }, [dexId]);

  const url = failed ? fallbackUrl : primaryUrl;

  return (
    <Image
      src={url}
      alt={pokemon.name}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className={`${facing === "right" ? "scale-x-[-1]" : ""} object-contain ${className ?? ""}`}
      style={{ width: size, height: size }}
    />
  );
}
