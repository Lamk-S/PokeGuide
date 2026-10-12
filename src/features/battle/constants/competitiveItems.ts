import { normalizeId } from "@/domain/shared/utils/normalizeId";

export interface CompetitiveItem {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  descriptionEs?: string;
  effect?: string;
  effectEs?: string;
}

export const COMPETITIVE_ITEM_NAMES = new Set([
  "life-orb",
  "choice-band",
  "choice-specs",
  "choice-scarf",
  "leftovers",
  "black-sludge",
  "heavy-duty-boots",
  "assault-vest",
  "focus-sash",
  "expert-belt",
  "muscle-band",
  "wise-glasses",
  "flame-orb",
  "toxic-orb",
  "light-clay",
  "eviolite",
  "rocky-helmet",
  "safety-goggles",
  "weakness-policy",
  "scope-lens",
  "razor-claw",
  "kings-rock",
  "metronome",
  "shell-bell",
  "loaded-dice",
  "booster-energy",
  "clear-amulet",
  "covert-cloak",
  "mirror-herb",
  "punching-glove",
  "air-balloon",
  "sitrus-berry",
  "lum-berry",
  "yache-berry",
  "shuca-berry",
  "wacan-berry",
  "rindo-berry",
  "occa-berry",
  "passho-berry",
  "chople-berry",
  "kebia-berry",
  "colbur-berry",
  "roseli-berry",
  "charti-berry",
  "haban-berry",
  "kasib-berry",
  "shed-shell",
  "lagging-tail",
  "iron-ball",
  "mental-herb",
  "power-herb",
  "white-herb",
  "red-card",
  "eject-button",
  "eject-pack",
  "custap-berry",
  "adrenaline-orb",
  "terrain-extender",
  "electric-seed",
  "grassy-seed",
  "misty-seed",
  "psychic-seed",
  "throat-spray",
  "blunder-policy",
  "room-service",
  "utility-umbrella",
  "ability-shield",
]);

export const COMPETITIVE_ITEMS: CompetitiveItem[] = [
  {
    id: "life-orb",
    name: "life-orb",
    nameEs: "Vidasfera",
    description: "Boosts power 30% at cost of HP",
    descriptionEs: "Potencia 30% a cambio de PS",
    effect: "Potencia 30% a cambio de PS",
    effectEs: "Potencia 30% a cambio de PS",
  },
  {
    id: "choice-band",
    name: "choice-band",
    nameEs: "Cinta Elegida",
    description: "Boosts Attack 50%",
    descriptionEs: "Sube Ataque 50%, bloquea movimiento",
    effect: "Sube Ataque 50%, bloquea movimiento",
    effectEs: "Sube Ataque 50%, bloquea movimiento",
  },
  {
    id: "choice-specs",
    name: "choice-specs",
    nameEs: "Gafas Elegidas",
    description: "Boosts SpA 50%",
    descriptionEs: "Sube At.Esp 50%, bloquea movimiento",
    effect: "Sube At.Esp 50%, bloquea movimiento",
    effectEs: "Sube At.Esp 50%, bloquea movimiento",
  },
  {
    id: "choice-scarf",
    name: "choice-scarf",
    nameEs: "Pañuelo Elegido",
    description: "Boosts Speed 50%",
    descriptionEs: "Sube Velocidad 50%, bloquea movimiento",
    effect: "Sube Velocidad 50%, bloquea movimiento",
    effectEs: "Sube Velocidad 50%, bloquea movimiento",
  },
  {
    id: "leftovers",
    name: "leftovers",
    nameEs: "Restos",
    description: "Restores HP each turn",
    descriptionEs: "Restaura PS cada turno",
    effect: "Restaura PS cada turno",
    effectEs: "Restaura PS cada turno",
  },
  {
    id: "heavy-duty-boots",
    name: "heavy-duty-boots",
    nameEs: "Botas Gruesas",
    description: "Immune to hazards",
    descriptionEs: "Inmune a púas",
    effect: "Inmune a púas",
    effectEs: "Inmune a púas",
  },
  {
    id: "focus-sash",
    name: "focus-sash",
    nameEs: "Banda Focus",
    description: "Survives one hit",
    descriptionEs: "Sobrevive 1 golpe a PS llenos",
    effect: "Sobrevive 1 golpe a PS llenos",
    effectEs: "Sobrevive 1 golpe a PS llenos",
  },
  {
    id: "rocky-helmet",
    name: "rocky-helmet",
    nameEs: "Casco Dentado",
    description: "Damages attacker on contact",
    descriptionEs: "Daña al atacante por contacto",
    effect: "Daña al atacante por contacto",
    effectEs: "Daña al atacante por contacto",
  },
];

export function isCompetitiveItem(itemName: string): boolean {
  return COMPETITIVE_ITEM_NAMES.has(normalizeId(itemName));
}
export function filterCompetitiveItems<T extends { name: string }>(
  items: T[],
): T[] {
  const filtered = items.filter((i) => isCompetitiveItem(i.name));
  return filtered.length >= 5 ? filtered : items;
}
export function translateItemToSpanish(id: string): string | undefined {
  return COMPETITIVE_ITEMS.find((i) => normalizeId(i.id) === normalizeId(id))
    ?.nameEs;
}
