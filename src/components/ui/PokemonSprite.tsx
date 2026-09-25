"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";

interface Props {
  pokemon: { id: number; name: string };
  facing?: "left" | "right";
  size?: number;
}

export function PokemonSprite({ pokemon, facing = "left", size = 44 }: Props) {
  const [idx, setIdx] = useState(0);

  const identity = useMemo(
    () => parsePokemonIdentity({ id: pokemon.id, name: pokemon.name }),
    [pokemon.id, pokemon.name],
  );

  const resolution = useMemo(() => resolvePokemonSprite(identity), [identity]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset sprite on identity change
  useEffect(() => {
    setIdx(0);
  }, [identity.debugKey]);

  const src = useMemo(() => {
    return resolution.chain[Math.min(idx, resolution.chain.length - 1)];
  }, [resolution.chain, idx]);

  return (
    <span
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center shrink-0"
    >
      <Image
        src={src}
        alt={pokemon.name}
        width={size}
        height={size}
        style={{
          objectFit: "contain",
          transform: facing === "right" ? "scaleX(-1)" : undefined,
        }}
        onError={() =>
          setIdx((i) => Math.min(i + 1, resolution.chain.length - 1))
        }
        unoptimized
      />
    </span>
  );
}
