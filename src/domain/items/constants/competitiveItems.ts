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

function c(id: string, nameEs: string, effectEs: string): CompetitiveItem {
  return {
    id,
    name: id,
    nameEs,
    description: effectEs,
    descriptionEs: effectEs,
    effect: effectEs,
    effectEs,
  };
}

export const COMPETITIVE_ITEMS: CompetitiveItem[] = [
  c("life-orb", "Vidasfera", "Potencia 30% a cambio de PS"),
  c("choice-band", "Cinta Elegida", "Sube Ataque 50%, bloquea movimiento"),
  c("choice-specs", "Gafas Elegidas", "Sube At.Esp 50%, bloquea movimiento"),
  c(
    "choice-scarf",
    "Pañuelo Elegido",
    "Sube Velocidad 50%, bloquea movimiento",
  ),
  c("leftovers", "Restos", "Restaura PS cada turno"),
  c("black-sludge", "Lodo Negro", "Cura a Veneno, daña a otros"),
  c("heavy-duty-boots", "Botas Gruesas", "Inmune a púas"),
  c("assault-vest", "Chaleco Asalto", "Sube Def.Esp 50%, sin estados"),
  c("focus-sash", "Banda Focus", "Sobrevive 1 golpe a PS llenos"),
  c("focus-band", "Cinta Focus", "10% sobrevivir con 1 PS"),
  c("expert-belt", "Cinta Experto", "Potencia súper eficaz 20%"),
  c("muscle-band", "Cinta Fuerte", "Potencia físico 10%"),
  c("wise-glasses", "Gafas Sabias", "Potencia especial 10%"),
  c("flame-orb", "Llamasfera", "Quema al portador"),
  c("toxic-orb", "Toxisfera", "Envenena al portador"),
  c("light-clay", "Refleluz", "Extiende pantallas"),
  c("eviolite", "Mineral Evolutivo", "Sube Def/Def.Esp si no evolucionado"),
  c("rocky-helmet", "Casco Dentado", "Daña al atacante por contacto"),
  c("safety-goggles", "Gafas de Seguridad", "Inmune a clima y polvos"),
  c(
    "weakness-policy",
    "Seguro Debilidad",
    "Sube At/AtEsp al recibir súper eficaz",
  ),
  c("clear-amulet", "Amuleto Puro", "Evita bajadas de stats"),
  c("covert-cloak", "Capa Furtiva", "Protege de efectos secundarios"),
  c("booster-energy", "Energía Potenciadora", "Activa habilidad Paradoja"),
  c("loaded-dice", "Dado Trucado", "Golpes múltiples pegan más veces"),
  c("punching-glove", "Guante de Boxeo", "Potencia puñetazos"),
  c("sitrus-berry", "Baya Ziuela", "Restaura 25% PS al 50%"),
  c("lum-berry", "Baya Lum", "Cura estados"),
  c("charizardite-x", "Charizardita X", "Megaevolución Charizard X"),
  c("charizardite-y", "Charizardita Y", "Megaevolución Charizard Y"),
  c("garchompite", "Garchompita", "Mega Garchomp"),
  c("tyranitarite", "Tyranitarita", "Mega Tyranitar"),
  c("scizorite", "Scizorita", "Mega Scizor"),
  c("kangaskhanite", "Kangaskhanita", "Mega Kangaskhan"),
];

export const COMPETITIVE_ITEM_NAMES = new Set(
  COMPETITIVE_ITEMS.map((i) => normalizeId(i.id)),
);

export const ITEM_ES_MAP = new Map<string, string>(
  COMPETITIVE_ITEMS.map((i) => [normalizeId(i.id), i.nameEs]),
);

export function translateItemToSpanish(id: string): string | undefined {
  return ITEM_ES_MAP.get(normalizeId(id));
}

export function isCompetitiveItem(itemName: string): boolean {
  return COMPETITIVE_ITEM_NAMES.has(normalizeId(itemName));
}

export function filterCompetitiveItems<
  T extends { name: string; nameEs?: string; id?: string },
>(items: T[]): T[] {
  if (!items || items.length === 0) return items;
  const filtered = items.filter((i) => {
    const candidate = (i as { id?: string }).id || i.name || i.nameEs || "";
    return isCompetitiveItem(candidate) || isCompetitiveItem(i.name);
  });
  return filtered.length >= 5 ? filtered : items;
}

export const VALID_ITEM_IDS = COMPETITIVE_ITEM_NAMES;
