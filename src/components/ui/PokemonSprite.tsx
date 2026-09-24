"use client";
import { useState, useMemo } from "react";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";

interface PokemonSpriteProps {
  pokemon: { id: number; name: string };
  facing?: "left" | "right";
  size?: number;
  hd?: boolean;
}

export function PokemonSprite({
  pokemon,
  facing = "left",
  size = 44,
  hd = false,
}: PokemonSpriteProps) {
  void hd;
  const [currentIndex, setCurrentIndex] = useState(0);

  const identity = useMemo(
    () => parsePokemonIdentity({ id: pokemon.id, name: pokemon.name }),
    [pokemon.id, pokemon.name],
  );
  const resolution = useMemo(() => resolvePokemonSprite(identity), [identity]);

  const src =
    resolution.chain[Math.min(currentIndex, resolution.chain.length - 1)];

  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={identity.debugKey}
    >
      {/* biome-ignore lint/performance/noImgElement: external PokeAPI sprite chain with onError fallback requires <img> */}
      <img
        src={src}
        alt={pokemon.name}
        width={size}
        height={size}
        style={{
          objectFit: "contain",
          width: size,
          height: size,
          transform: facing === "right" ? "scaleX(-1)" : undefined,
        }}
        onError={() =>
          setCurrentIndex((i) => Math.min(i + 1, resolution.chain.length - 1))
        }
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
