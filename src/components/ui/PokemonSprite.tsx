"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";

interface Props {
  pokemon: { id: number; name: string };
  size?: number;
  shiny?: boolean;
  facing?: "left" | "right";
  className?: string;
}

export function PokemonSprite({ pokemon, size = 48, className }: Props) {
  const identity = useMemo(
    () => parsePokemonIdentity({ id: pokemon.id, name: pokemon.name }),
    [pokemon.id, pokemon.name],
  );
  const resolved = useMemo(() => resolvePokemonSprite(identity), [identity]);
  const [idx, setIdx] = useState(0);
  const current = resolved.chain[idx] ?? resolved.url;

  if (!current) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-[#F8F5F0] border border-[#EDE8E0]"
      />
    );
  }

  return (
    <Image
      src={current}
      alt={pokemon.name}
      width={size}
      height={size}
      unoptimized
      onError={() => {
        if (idx + 1 < resolved.chain.length) setIdx((p) => p + 1);
      }}
      className={className ?? "object-contain"}
    />
  );
}

export default PokemonSprite;
