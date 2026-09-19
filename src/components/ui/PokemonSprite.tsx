"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SpriteResolver } from "@/infrastructure/pokemon/SpriteResolver";

interface Props {
  pokemon: { id: number; name: string };
  className?: string;
  facing?: "left" | "right";
  size?: number;
  hd?: boolean;
}

export function PokemonSprite({
  pokemon,
  className,
  facing,
  size = 112,
  hd = false,
}: Props) {
  const chain = useMemo(
    () => SpriteResolver.getSpriteChain(pokemon, hd),
    [pokemon, hd],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (chain.length > 0) {
      setIndex(0);
    }
  }, [chain]);

  const src = chain[index] ?? "/placeholder-sprite.png";
  const isPixelArt = src.includes("/ani/") || src.includes("/gen5/");

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "relative flex items-center justify-center shrink-0 select-none",
        className,
      )}
    >
      <Image
        src={src}
        alt={pokemon.name}
        fill
        unoptimized
        loader={({ src: s }) => s}
        sizes={`${size}px`}
        style={{
          objectFit: "contain",
          imageRendering: isPixelArt ? "pixelated" : "auto",
        }}
        className={cn("drop-shadow-md", facing === "left" && "-scale-x-100")}
        onError={() => {
          if (index < chain.length - 1) {
            setIndex((i) => i + 1);
          }
        }}
      />
    </div>
  );
}
