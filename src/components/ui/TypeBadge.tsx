"use client";

const TYPE_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  FUEGO: { bg: "#FFE8D6", text: "#7A3D1A", dot: "#E86C2A", border: "#FFC8A0" },
  AGUA: { bg: "#DCEEFF", text: "#2F5D8A", dot: "#4A90D9", border: "#B8D4F0" },
  PLANTA: { bg: "#E3F3D8", text: "#2D5A27", dot: "#5DBB35", border: "#C5E1B0" },
  ELÉCTRICO: {
    bg: "#FFF3C4",
    text: "#7A5D00",
    dot: "#D9A900",
    border: "#F5E6A0",
  },
  VENENO: { bg: "#F0E0F5", text: "#6B4C7A", dot: "#9C5FB0", border: "#D8C0E0" },
  VOLADOR: {
    bg: "#E8E6FF",
    text: "#5A5A8A",
    dot: "#8B83D0",
    border: "#D0C8F0",
  },
  DRAGÓN: { bg: "#E2E6FF", text: "#4B4CA6", dot: "#6F6EFF", border: "#C5C8FF" },
  TIERRA: { bg: "#F2E8D0", text: "#7A5E2E", dot: "#B89A5A", border: "#E0D0A0" },
  SINIESTRO: {
    bg: "#E8E2DC",
    text: "#5A4E47",
    dot: "#705848",
    border: "#D0C4B8",
  },
  FANTASMA: {
    bg: "#E6E0F0",
    text: "#5A4C7A",
    dot: "#705898",
    border: "#D0C0E0",
  },
  NORMAL: { bg: "#F0EDE6", text: "#5F6B7A", dot: "#A8A878", border: "#E8E0D6" },
  LUCHA: { bg: "#F8D8D0", text: "#7A2E1A", dot: "#C03028", border: "#F0B8A8" },
  PSÍQUICO: {
    bg: "#FAD0D8",
    text: "#7A2E4A",
    dot: "#F85888",
    border: "#F0B8C8",
  },
  HIELO: { bg: "#D8F0F0", text: "#2E5A5A", dot: "#98D8D8", border: "#B8E0E0" },
  ROCA: { bg: "#E8DCC0", text: "#5A4A2E", dot: "#B8A038", border: "#D8C8A0" },
  BICHO: { bg: "#E8F0C8", text: "#4A5A2E", dot: "#A8B820", border: "#D0E0A0" },
  ACERO: { bg: "#E8E8F0", text: "#4A4A5A", dot: "#B8B8D0", border: "#D0D0E0" },
  HADA: { bg: "#F8E0E8", text: "#7A4A5A", dot: "#EE99AC", border: "#F0C0D0" },
  FIRE: { bg: "#FFE8D6", text: "#7A3D1A", dot: "#E86C2A", border: "#FFC8A0" },
  WATER: { bg: "#DCEEFF", text: "#2F5D8A", dot: "#4A90D9", border: "#B8D4F0" },
  GRASS: { bg: "#E3F3D8", text: "#2D5A27", dot: "#5DBB35", border: "#C5E1B0" },
  ELECTRIC: {
    bg: "#FFF3C4",
    text: "#7A5D00",
    dot: "#D9A900",
    border: "#F5E6A0",
  },
  POISON: { bg: "#F0E0F5", text: "#6B4C7A", dot: "#9C5FB0", border: "#D8C0E0" },
  FLYING: { bg: "#E8E6FF", text: "#5A5A8A", dot: "#8B83D0", border: "#D0C8F0" },
  DRAGON: { bg: "#E2E6FF", text: "#4B4CA6", dot: "#6F6EFF", border: "#C5C8FF" },
  GROUND: { bg: "#F2E8D0", text: "#7A5E2E", dot: "#B89A5A", border: "#E0D0A0" },
  DARK: { bg: "#E8E2DC", text: "#5A4E47", dot: "#705848", border: "#D0C4B8" },
  GHOST: { bg: "#E6E0F0", text: "#5A4C7A", dot: "#705898", border: "#D0C0E0" },
};

export const TYPE_ES_MAP: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
  fuego: "Fuego",
  agua: "Agua",
  planta: "Planta",
  eléctrico: "Eléctrico",
  electrico: "Eléctrico",
  hielo: "Hielo",
  lucha: "Lucha",
  veneno: "Veneno",
  tierra: "Tierra",
  volador: "Volador",
  psíquico: "Psíquico",
  psiquico: "Psíquico",
  bicho: "Bicho",
  roca: "Roca",
  fantasma: "Fantasma",
  dragón: "Dragón",
  siniestro: "Siniestro",
  acero: "Acero",
  hada: "Hada",
};

export function translateType(type: string): string {
  if (!type) return type;
  const key = type.trim().toLowerCase();
  return TYPE_ES_MAP[key] || type;
}

export function translateTypeUpper(type: string): string {
  return translateType(type).toUpperCase();
}

function getStyle(type: string) {
  const upper = translateType(type).toUpperCase();
  return (
    TYPE_STYLES[upper] ||
    TYPE_STYLES[type.toUpperCase()] ||
    TYPE_STYLES[type] || {
      bg: "#F0EDE6",
      text: "#7A7570",
      dot: "#B9C4D1",
      border: "#EDE8E0",
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
  const label = translateTypeUpper(type);
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-semibold uppercase tracking-wide border ${isSm ? "gap-1 px-1.5 py-0.5 text-[9px]" : "gap-1.25 px-2 py-0.5 text-[10px]"}`}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      <span
        className={`${isSm ? "size-1" : "size-1.25"} rounded-full shrink-0`}
        style={{ background: s.dot }}
      />
      {label}
    </span>
  );
}
