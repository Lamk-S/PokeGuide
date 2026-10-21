"use client";
import Image from "next/image";
import { useMemo } from "react";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import { resolvePokemonSprite } from "@/domain/pokemon/services/PokemonSpriteResolver";

type Pokemon = { id: number; name: string };

type Props = {
  pokemon: Pokemon;
  size?: number;
  shiny?: boolean;
  className?: string;
  facing?: "left" | "right";
};

export function PokemonSprite({
  pokemon,
  size = 64,
  shiny = false,
  className,
  facing: _facing,
}: Props) {
  const identity = useMemo(
    () => parsePokemonIdentity(pokemon.id, pokemon.name),
    [pokemon.id, pokemon.name],
  );
  const resolved = useMemo(
    () => resolvePokemonSprite(identity, { shiny }),
    [identity, shiny],
  );

  const src =
    resolved.chain[0] ??
    resolved.primary ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: "relative" }}
    >
      <Image
        src={src}
        alt={pokemon.name}
        width={size}
        height={size}
        unoptimized
        style={{ objectFit: "contain" }}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          const chain = resolved.chain;
          const currentIndex = chain.indexOf(img.src);
          const next = chain[currentIndex + 1] ?? chain[0];
          if (next && img.src !== next) img.src = next;
        }}
      />
    </div>
  );
}

export default PokemonSprite;
