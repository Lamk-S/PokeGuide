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

function c(id: string, nameEs: string, es: string): CompetitiveItem {
  return {
    id,
    name: id,
    nameEs,
    description: es,
    descriptionEs: es,
    effect: es,
    effectEs: es,
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
  c("expert-belt", "Cinta Experto", "Potencia súper eficaz 20%"),
  c("muscle-band", "Cinta Fuerte", "Potencia físico 10%"),
  c("wise-glasses", "Gafas Sabias", "Potencia especial 10%"),
  c("flame-orb", "Llamasfera", "Quema al portador"),
  c("toxic-orb", "Toxisfera", "Envenena al portador"),
  c("light-clay", "Refleluz", "Extiende pantallas"),
  c(
    "eviolite",
    "Mineral Evolutivo",
    "Sube Def/Def.Esp si no está evolucionado",
  ),
  c("rocky-helmet", "Casco Dentado", "Daña al atacante por contacto"),
  c("safety-goggles", "Gafas de Seguridad", "Inmune a clima y polvos"),
  c(
    "weakness-policy",
    "Seguro Debilidad",
    "Sube At/AtEsp al recibir súper eficaz",
  ),
  c("scope-lens", "Periscopio", "Sube ratio crítico"),
  c("razor-claw", "Garra Afilada", "Sube ratio crítico"),
  c("kings-rock", "Roca del Rey", "Puede amedrentar"),
  c("metronome", "Metrónomo", "Potencia mismo mov. repetido"),
  c("shell-bell", "Campana Concha", "Cura al dañar"),
  c("loaded-dice", "Dado Trucado", "Golpes múltiples pegan más veces"),
  c("booster-energy", "Energía Potenciadora", "Activa habilidad Paradoja"),
  c("clear-amulet", "Amuleto Puro", "Evita bajadas de stats"),
  c("covert-cloak", "Capa Furtiva", "Protege de efectos secundarios"),
  c("mirror-herb", "Hierba Copia", "Copia subidas rival"),
  c("punching-glove", "Guante de Boxeo", "Potencia puñetazos"),
  c("air-balloon", "Globo", "Inmune Tierra hasta ser golpeado"),
  c("sitrus-berry", "Baya Ziuela", "Restaura 25% PS al 50%"),
  c("lum-berry", "Baya Lum", "Cura estados"),
  c("yache-berry", "Baya Yache", "Reduce Hielo"),
  c("shuca-berry", "Baya Shuca", "Reduce Tierra"),
  c("wacan-berry", "Baya Wacan", "Reduce Eléctrico"),
  c("rindo-berry", "Baya Rindo", "Reduce Planta"),
  c("occa-berry", "Baya Occa", "Reduce Fuego"),
  c("passho-berry", "Baya Passho", "Reduce Agua"),
  c("chople-berry", "Baya Pomaro", "Reduce Lucha"),
  c("kebia-berry", "Baya Kebia", "Reduce Veneno"),
  c("colbur-berry", "Baya Cumbre", "Reduce Siniestro"),
  c("roseli-berry", "Baya Roseli", "Reduce Hada"),
  c("charti-berry", "Baya Antiara", "Reduce Roca"),
  c("haban-berry", "Baya Haban", "Reduce Dragón"),
  c("kasib-berry", "Baya Kasib", "Reduce Fantasma"),
  c("shed-shell", "Muda Concha", "Permite cambio pese a bloqueo"),
  c("lagging-tail", "Cola Plúmbea", "Se mueve al final"),
  c("iron-ball", "Bola Férrea", "Anula Levitación, baja Velocidad"),
  c("mental-herb", "Hierba Mental", "Bloquea Mofa/Broma etc"),
  c("power-herb", "Hierba Única", "Salta turno de carga"),
  c("white-herb", "Hierba Blanca", "Restaura stats bajados"),
  c("red-card", "Tarjeta Roja", "Fuerza cambio rival al ser golpeado"),
  c("eject-button", "Botón Escape", "Cambia al ser golpeado"),
  c("eject-pack", "Mochila Escape", "Cambia al bajar stats"),
  c("custap-berry", "Baya Chiri", "Primero con 25% PS"),
  c("adrenaline-orb", "Orbe Adrenalina", "Sube Velocidad vs Intimidación"),
  c("terrain-extender", "Cubresuelos", "Extiende campo"),
  c("electric-seed", "Semilla Eléctrica", "Sube Defensa en Campo Eléctrico"),
  c("grassy-seed", "Semilla Hierba", "Sube Defensa en Campo Hierba"),
  c("misty-seed", "Semilla Bruma", "Sube Def.Esp en Campo Niebla"),
  c("psychic-seed", "Semilla Psíquica", "Sube Def.Esp en Campo Psíquico"),
  c("throat-spray", "Spray Bucal", "Sube At.Esp tras mov. sonido"),
  c("blunder-policy", "Seguro Fallo", "Sube Velocidad tras fallo"),
  c("room-service", "Servicio Habitación", "Baja Velocidad en Espacio Raro"),
  c("utility-umbrella", "Sombrilla Amplia", "Protege de efectos clima"),
  c("ability-shield", "Escudo Habilidad", "Bloquea cambios de habilidad"),
];

export const COMPETITIVE_ITEM_NAMES = new Set(
  COMPETITIVE_ITEMS.map((i) => normalizeId(i.id)),
);

const ITEM_ES_MAP = new Map<string, string>(
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
