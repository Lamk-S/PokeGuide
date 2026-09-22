"use client";

const TYPE_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  Veneno: { bg: "#EFE2F3", text: "#6B4C7A", dot: "#A040A0", border: "#D8C0E0" },
  Eléctrico: {
    bg: "#FFF3C4",
    text: "#7A5D00",
    dot: "#D9A900",
    border: "#F5E6A0",
  },
  Dragón: { bg: "#E2E6FF", text: "#4B4CA6", dot: "#6F6EFF", border: "#C5C8FF" },
  Tierra: { bg: "#F2E8D0", text: "#7A5E2E", dot: "#B89A5A", border: "#E0D0A0" },
  Agua: { bg: "#DCEEFF", text: "#2F5D8A", dot: "#4A90D9", border: "#B8D4F0" },
  Siniestro: {
    bg: "#E8E2DC",
    text: "#5A4E47",
    dot: "#705848",
    border: "#D0C4B8",
  },
  Fuego: { bg: "#FFE2D0", text: "#8A3D1A", dot: "#E86C2A", border: "#FFC8A0" },
  Volador: {
    bg: "#E8E6FF",
    text: "#5A5A8A",
    dot: "#A8A0D0",
    border: "#D0C8F0",
  },
  Fantasma: {
    bg: "#E6E0F0",
    text: "#5A4C7A",
    dot: "#705898",
    border: "#D0C0E0",
  },
  Planta: { bg: "#D9EAD3", text: "#2D5A27", dot: "#78C850", border: "#B8D4B0" },
  Normal: { bg: "#F0F3F7", text: "#5F6B7A", dot: "#A8A878", border: "#E0E6EB" },
  Lucha: { bg: "#F8D8D0", text: "#7A2E1A", dot: "#C03028", border: "#F0B8A8" },
  Psíquico: {
    bg: "#FAD0D8",
    text: "#7A2E4A",
    dot: "#F85888",
    border: "#F0B8C8",
  },
  Hielo: { bg: "#D8F0F0", text: "#2E5A5A", dot: "#98D8D8", border: "#B8E0E0" },
  Roca: { bg: "#E8DCC0", text: "#5A4A2E", dot: "#B8A038", border: "#D8C8A0" },
  Bicho: { bg: "#E8F0C8", text: "#4A5A2E", dot: "#A8B820", border: "#D0E0A0" },
  Acero: { bg: "#E8E8F0", text: "#4A4A5A", dot: "#B8B8D0", border: "#D0D0E0" },
  Hada: { bg: "#F8E0E8", text: "#7A4A5A", dot: "#EE99AC", border: "#F0C0D0" },
  // English fallbacks
  poison: { bg: "#EFE2F3", text: "#6B4C7A", dot: "#A040A0", border: "#D8C0E0" },
  electric: {
    bg: "#FFF3C4",
    text: "#7A5D00",
    dot: "#D9A900",
    border: "#F5E6A0",
  },
  dragon: { bg: "#E2E6FF", text: "#4B4CA6", dot: "#6F6EFF", border: "#C5C8FF" },
  ground: { bg: "#F2E8D0", text: "#7A5E2E", dot: "#B89A5A", border: "#E0D0A0" },
  water: { bg: "#DCEEFF", text: "#2F5D8A", dot: "#4A90D9", border: "#B8D4F0" },
  dark: { bg: "#E8E2DC", text: "#5A4E47", dot: "#705848", border: "#D0C4B8" },
  fire: { bg: "#FFE2D0", text: "#8A3D1A", dot: "#E86C2A", border: "#FFC8A0" },
  flying: { bg: "#E8E6FF", text: "#5A5A8A", dot: "#A8A0D0", border: "#D0C8F0" },
  ghost: { bg: "#E6E0F0", text: "#5A4C7A", dot: "#705898", border: "#D0C0E0" },
  grass: { bg: "#D9EAD3", text: "#2D5A27", dot: "#78C850", border: "#B8D4B0" },
  normal: { bg: "#F0F3F7", text: "#5F6B7A", dot: "#A8A878", border: "#E0E6EB" },
  fighting: {
    bg: "#F8D8D0",
    text: "#7A2E1A",
    dot: "#C03028",
    border: "#F0B8A8",
  },
  psychic: {
    bg: "#FAD0D8",
    text: "#7A2E4A",
    dot: "#F85888",
    border: "#F0B8C8",
  },
  ice: { bg: "#D8F0F0", text: "#2E5A5A", dot: "#98D8D8", border: "#B8E0E0" },
  rock: { bg: "#E8DCC0", text: "#5A4A2E", dot: "#B8A038", border: "#D8C8A0" },
  bug: { bg: "#E8F0C8", text: "#4A5A2E", dot: "#A8B820", border: "#D0E0A0" },
  steel: { bg: "#E8E8F0", text: "#4A4A5A", dot: "#B8B8D0", border: "#D0D0E0" },
  fairy: { bg: "#F8E0E8", text: "#7A4A5A", dot: "#EE99AC", border: "#F0C0D0" },
};

function getStyle(type: string) {
  return (
    TYPE_STYLES[type] ||
    TYPE_STYLES[type.toLowerCase()] || {
      bg: "#F0F3F7",
      text: "#5F6B7A",
      dot: "#B9C4D1",
      border: "#E0E6EB",
    }
  );
}

export function getTypeStyle(type: string) {
  return getStyle(type);
}

export function TypeBadge({
  type,
  size = "md",
}: {
  type: string;
  size?: "sm" | "md";
}) {
  const s = getStyle(type);
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium uppercase tracking-wide ${isSm ? "gap-1 px-1.5 py-0.5 text-[10px]" : "gap-1.25 px-2 py-0.5 text-[11px]"}`}
      style={{ background: s.bg, color: s.text }}
    >
      <span
        className={`${isSm ? "size-1" : "size-1.25"} rounded-full shrink-0`}
        style={{ background: s.dot }}
      />
      {type}
    </span>
  );
}
