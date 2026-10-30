"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

interface Props {
  itemName: string;
  size?: number;
}

function getItemSpriteUrls(name: string): string[] {
  const normalized = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return [
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalized}.png`,
  ];
}

export function ItemSprite({ itemName, size = 24 }: Props) {
  const urls = useMemo(() => getItemSpriteUrls(itemName), [itemName]);
  const [idx, setIdx] = useState(0);
  const firstUrl = urls[0] ?? "";
  const current = urls[idx] ?? firstUrl;

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
      alt={itemName}
      width={size}
      height={size}
      onError={() => {
        if (idx + 1 < urls.length) setIdx((p) => p + 1);
      }}
      className="object-contain"
      unoptimized
    />
  );
}

export default ItemSprite;
