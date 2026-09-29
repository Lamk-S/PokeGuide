"use client";
import { useState } from "react";
import Image from "next/image";

interface ItemSpriteProps {
  itemName: string;
  size?: number;
  className?: string;
}

export function ItemSprite({
  itemName,
  size = 24,
  className = "",
}: ItemSpriteProps) {
  const [failed, setFailed] = useState(false);

  const normalized = itemName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const urls = [
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`,
    `https://raw.githubusercontent.com/msikma/pokesprite/master/items/${normalized}.png`,
  ];

  if (failed || !normalized) {
    return (
      <span
        className={`inline-flex items-center justify-center text-[10px] ${className}`}
        style={{ width: size, height: size }}
      >
        🎒
      </span>
    );
  }

  return (
    <Image
      src={urls[0]}
      alt={itemName}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function getItemSpriteUrl(itemName: string): string {
  const normalized = itemName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`;
}
