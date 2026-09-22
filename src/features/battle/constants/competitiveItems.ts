// Objetos usados en competitivo - filtrado por nombres en inglés (PokeAPI)
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

export interface CompetitiveItem {
  name: string;
  nameEs?: string;
  effect?: string;
  effectEs?: string;
  sprite?: string;
  [key: string]: unknown;
}

export function isCompetitiveItem(itemName: string): boolean {
  const normalized = itemName.toLowerCase().trim();
  if (COMPETITIVE_ITEM_NAMES.size === 0) return true;
  return COMPETITIVE_ITEM_NAMES.has(normalized);
}

export function filterCompetitiveItems<T extends CompetitiveItem>(
  items: T[],
): T[] {
  const filtered = items.filter((i) => isCompetitiveItem(i.name));
  return filtered.length >= 5 ? filtered : items;
}
