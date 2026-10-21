"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { parsePokemonIdentity } from "@/domain/pokemon/value-objects/PokemonIdentity";
import {
  getOfficialArtworkUrl,
  resolvePokemonSprite,
  type SpriteResult,
} from "@/domain/pokemon/services/PokemonSpriteResolver";

type Props = {
  pokemon: { id: number; name: string };
  size?: number;
  className?: string;
  facing?: "left" | "right";
};

export function PokemonSprite({
  pokemon,
  size = 48,
  className,
  facing,
}: Props) {
  const identity = useMemo(
    () => parsePokemonIdentity({ id: pokemon.id, name: pokemon.name }),
    [pokemon.id, pokemon.name],
  );
  const resolved: SpriteResult = useMemo(
    () => resolvePokemonSprite(identity),
    [identity],
  );
  const official = useMemo(
    () => getOfficialArtworkUrl(pokemon.id),
    [pokemon.id],
  );
  const candidates = useMemo(() => {
    const chain = resolved.chain;
    return chain && chain.length > 0 ? chain : [official];
  }, [resolved, official]);
  const [idx, setIdx] = useState(0);
  const current = candidates[idx] ?? official;
  const facingClass = facing === "right" ? "scale-x-[-1]" : "";
  const combined = [className ?? "object-contain", facingClass]
    .filter(Boolean)
    .join(" ");
  return (
    <Image
      src={current}
      alt={pokemon.name}
      width={size}
      height={size}
      unoptimized
      onError={() => {
        if (idx + 1 < candidates.length) setIdx((p) => p + 1);
      }}
      className={combined}
    />
  );
}
export default PokemonSprite;
